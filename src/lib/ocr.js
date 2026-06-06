/**
 * IEEE Membership Card OCR Engine — v2
 *
 * Output contract (matches Auth.jsx `handleIeeeSignUp` meta fields):
 *   fullName         → string | null   (→ meta.full_name)
 *   memberId         → string | null   (→ meta.membership_id)
 *   expiryDate       → Date   | null   (→ meta.membership_expiry after ISO conversion)
 *   subsection       → string | null   (→ meta.subsection)
 *   isIas            → bool            (→ meta.ias_status: cardData.isIas ? 'pending' : 'none')
 *   isExpired        → bool
 *   expiresWithin30Days → bool
 *   daysUntilExpiry  → number | null
 *
 * Pipeline:
 *  1. Convert PDF page → <canvas> via pdf.js (lazy CDN import)
 *  2. Pre-process canvas  (scale ×3, grayscale, contrast boost)
 *  3. Run Tesseract.js OCR on the processed PNG blob
 *  4. Parse extracted text with targeted regexes
 *  5. Validate card structure  (must contain "IEEE", "Member", and 8–10 digit ID)
 *  6. Guard against accidental non-IEEE document upload
 */
 
// ─── pdf.js (lazy CDN) ───────────────────────────────────────────────────────
let pdfjsLib = null;
 
async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  const module = await import(
    /* @vite-ignore */
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs'
  );
  module.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';
  pdfjsLib = module;
  return pdfjsLib;
}

// ─── Direct PDF text layer extraction ──────────────────────────────────────────
async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs       = await getPdfJs();
  const pdf         = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page        = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  return textContent.items.map(item => item.str).join('\n');
}

// ─── Parser: Email ────────────────────────────────────────────────────────────
function extractEmail(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0].trim() : null;
}
 
// ─── Canvas pre-processing ────────────────────────────────────────────────────
async function pdfToPreprocessedBlob(file, scaleFactor = 3) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs       = await getPdfJs();
  const pdf         = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page        = await pdf.getPage(1);
 
  const viewport = page.getViewport({ scale: scaleFactor });
  const canvas   = document.createElement('canvas');
  canvas.width   = viewport.width;
  canvas.height  = viewport.height;
  const ctx      = canvas.getContext('2d');
 
  await page.render({ canvasContext: ctx, viewport }).promise;
 
  // Grayscale + contrast boost → sharper OCR output
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data      = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray       = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrasted = Math.min(255, Math.max(0, (gray - 128) * 1.6 + 128));
    data[i] = data[i + 1] = data[i + 2] = contrasted;
  }
  ctx.putImageData(imageData, 0, 0);
 
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  );
}
 
// ─── Tesseract worker (singleton) ─────────────────────────────────────────────
let worker = null;
 
async function getWorker() {
  if (worker) return worker;
  const { createWorker } = await import('tesseract.js');
  worker = await createWorker('eng', 1, {
    tessedit_pageseg_mode:    '1',
    tessedit_char_whitelist:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 #./,-',
  });
  return worker;
}
 
// ─── Parser: Member ID ───────────────────────────────────────────────────────
// Returns string matching meta.membership_id (8–10 digit IEEE number)
function extractMemberId(text) {
  const patterns = [
    /Member\s*#\s*(\d{8,10})/i,
    /Member\s+(?:Number|No\.?)\s*[:#]?\s*(\d{8,10})/i,
    /\b(\d{8,10})\b/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
}
 
// ─── Parser: Full Name ───────────────────────────────────────────────────────
// Returns string for meta.full_name — must survive Auth.jsx fullName.trim() check
function extractFullName(text) {
  // Strip known boilerplate phrases that mimic names
  const cleanText = text
    .replace(/You Can Achieve Great Things\.?/gi, '')
    .replace(/Thank You for Your Membership!?/gi, '')
    .replace(/Make the Most of Your Membership\.?/gi, '')
    .replace(/Industry Applications Society/gi, '')
    .replace(/Below is a digital version.*?anytime!/gis, '');
 
  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);
 
  // Strategy 1: Lines immediately above the Member # line
  const memberLineIdx = lines.findIndex((l) => /Member\s*#/i.test(l));
  if (memberLineIdx > 0) {
    for (let i = memberLineIdx - 1; i >= Math.max(0, memberLineIdx - 3); i--) {
      const candidate = lines[i];
 
      // ALL CAPS name like "ARON ALEX"
      const capsMatch = candidate.match(/^([A-Z][A-Z\s.\-]{2,30}[A-Z])(?=\s|$)/);
      if (capsMatch && !/STUDENT|MEMBER|IEEE|VALID/i.test(capsMatch[1])) {
        return capsMatch[1].trim();
      }
 
      // Title Case name like "Aron Alex"
      const titleMatch = candidate.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?=\s|$)/);
      if (titleMatch && !/Student|Member|Ieee/i.test(titleMatch[1])) {
        return titleMatch[1].trim();
      }
 
      // Fallback: whole line is just letters/spaces (≤40 chars)
      if (
        /^[A-Za-z][A-Za-z\s.\-]{2,39}$/.test(candidate) &&
        !/Student|Member|IEEE/i.test(candidate)
      ) {
        return candidate.trim();
      }
    }
  }
 
  // Strategy 2: Hunt for 2–4 ALL CAPS words grouped anywhere
  for (const line of lines) {
    const capsMatch = line.match(/\b([A-Z][A-Z.\-]*\s+[A-Z][A-Z\s.\-]{2,30}[A-Z])\b/);
    if (capsMatch) {
      const name = capsMatch[1].trim();
      if (
        name.includes(' ') &&
        !/IEEE|MEMBER|VALID|SUBSECTION|SECTION|STUDENT|VOLT|HERTZ|POWER|SOCIETY|INDUSTRY|PUBLICATIONS/i.test(name)
      ) {
        return name;
      }
    }
  }
 
  // Strategy 3: Title Case line fallback
  for (const line of lines) {
    if (
      /^([A-Z][A-Za-z.\-]{1,20}\s+){1,3}[A-Z][A-Za-z.\-]{1,20}$/.test(line) &&
      !/IEEE|Member|Valid|You|Below|Great|Things|Thank|Section|Branch|Technical|Publications|Career|Professional/i.test(line)
    ) {
      return line.trim();
    }
  }
 
  return null;
}
 
// ─── Parser: Expiry Date ─────────────────────────────────────────────────────
// Returns Date object for meta.membership_expiry ISO conversion in Auth.jsx
function extractExpiryDate(text) {
  const patterns = [
    /Valid\s+through\s+(\d{1,2}\s+\w+\s+\d{4})/i,
    /Valid\s+through\s+(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    /(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const parsed = new Date(m[1]);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return null;
}
 
// ─── Parser: Subsection ──────────────────────────────────────────────────────
// Returns string for meta.subsection
function extractSubsection(text) {
  const lines          = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const memberLineIdx  = lines.findIndex((l) => /Member\s*#/i.test(l));
 
  if (memberLineIdx >= 0 && memberLineIdx < lines.length - 1) {
    for (let i = memberLineIdx + 1; i <= Math.min(memberLineIdx + 4, lines.length - 1); i++) {
      const candidate = lines[i];
 
      const subMatch = candidate.match(/([A-Za-z\s]+)Subsection/i);
      if (subMatch) return subMatch[1].replace(/Location:\s*/i, '').trim();
 
      const locMatch = candidate.match(/Location:\s*([A-Za-z]+)/i);
      if (locMatch) return locMatch[1].trim();
    }
  }
 
  // Fallback: search entire text
  const subFallback = text.match(/([A-Za-z\s]+)Subsection/i);
  if (subFallback) return subFallback[1].replace(/Location:\s*/i, '').trim();
 
  const locFallback = text.match(/Location:\s*([A-Za-z]+)/i);
  return locFallback ? locFallback[1].trim() : null;
}
 
// ─── IAS Membership Detection ────────────────────────────────────────────────
// Returns bool; true → Auth.jsx sets ias_status: 'pending'
function detectIasMembership(text) {
  return (
    /Industry\s+Applications\s+Society/i.test(text) ||
    /\bIAS\b/.test(text) ||
    /IAS\s+Member/i.test(text)
  );
}
 
// ─── Card Structure Validator ────────────────────────────────────────────────
// Guards against accidental non-IEEE document upload (e.g. ISIC, student ID)
function validateCardStructure(text) {
  // Must contain both "IEEE" and "Member"
  const missingKeywords = ['IEEE', 'Member'].filter(
    (kw) => !new RegExp(kw, 'i').test(text)
  );
  if (missingKeywords.length > 0) {
    return {
      valid:  false,
      reason: `This doesn't appear to be an IEEE card — missing: ${missingKeywords.join(', ')}. ` +
              'Please upload your official IEEE digital membership card (PDF or image).',
    };
  }
 
  // Must contain an 8–10 digit member number
  if (!/\d{8,10}/.test(text)) {
    return {
      valid:  false,
      reason: 'No IEEE member number found. Please upload your official IEEE card.',
    };
  }
 
  // Guard: reject documents that look like non-IEEE cards with "IEEE" in boilerplate
  // (e.g. a document merely mentioning IEEE in body text)
  const ieeeCount = (text.match(/IEEE/gi) || []).length;
  if (ieeeCount < 2) {
    return {
      valid:  false,
      reason: 'Document does not appear to be a valid IEEE membership card.',
    };
  }
 
  return { valid: true, reason: 'OK' };
}
 
// ─── Public API ───────────────────────────────────────────────────────────────
 
/**
 * extractCardData(file, onProgress?)
 *
 * @param   {File}     file        — PDF or image File object from <input type="file">
 * @param   {Function} onProgress  — optional (percent: number, message: string) => void
 * @returns {Promise<CardResult>}
 *
 * Success shape (used by Auth.jsx → handleIeeeSignUp):
 *   { success: true, fullName, memberId, expiryDate, subsection, isIas,
 *     isExpired, expiresWithin30Days, daysUntilExpiry, rawText }
 *
 * Failure shape:
 *   { success: false, error: string, rawText?: string }
 */
export async function extractCardData(file, onProgress = () => {}) {
  try {
    onProgress(5, 'Loading PDF renderer…');
 
    let imageBlob;
    let rawText = '';
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      onProgress(12, 'Checking PDF text layer…');
      try {
        const text = await extractTextFromPdf(file);
        const structureCheck = validateCardStructure(text);
        if (structureCheck.valid && extractMemberId(text)) {
          rawText = text;
          onProgress(45, 'Direct text extracted…');
        }
      } catch (pdfErr) {
        console.warn('PDF text layer extraction failed, falling back to image rendering:', pdfErr);
      }

      if (!rawText) {
        onProgress(20, 'Rendering PDF page…');
        imageBlob = await pdfToPreprocessedBlob(file, 3);
      }
    } else {
      // Assume image — pass directly to Tesseract
      imageBlob = file;
    }

    if (!rawText) {
      onProgress(50, 'Running OCR (this takes ~10 s)…');
      const w         = await getWorker();
      const { data }  = await w.recognize(imageBlob);
      rawText   = data.text;
    }
 
    onProgress(80, 'Parsing membership data…');
 
    // ── Step 1: Card structure guard ───────────────────────────────────────
    const validation = validateCardStructure(rawText);
    if (!validation.valid) {
      return { success: false, error: validation.reason, rawText };
    }
 
    // ── Step 2: Field extraction ───────────────────────────────────────────
    const memberId   = extractMemberId(rawText);
    const fullName   = extractFullName(rawText);
    const expiryDate = extractExpiryDate(rawText);
    const subsection = extractSubsection(rawText);
    const isIas      = detectIasMembership(rawText);
    const email      = extractEmail(rawText);
 
    // memberId is critical — all other nulls get caught below
    if (!memberId) {
      return {
        success: false,
        error:   'Could not read the IEEE Member ID. Try a higher-quality scan or brighter lighting.',
        rawText,
      };
    }
 
    // ── Step 3: Expiry check ───────────────────────────────────────────────
    const now       = new Date();
    const isExpired = expiryDate ? expiryDate < now : false;
 
    // Require all critical fields; reject expired cards
    if (!fullName || !expiryDate || !subsection || isExpired) {
      const reason = isExpired
        ? 'Your IEEE membership appears to be expired. Please renew before registering.'
        : 'Could not extract all required fields (name / expiry / subsection). ' +
          'Please upload a clearer, unmodified IEEE digital card.';
      return { success: false, error: reason, rawText };
    }
 
    // ── Step 4: Proximity check ────────────────────────────────────────────
    const daysUntilExpiry    = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    const expiresWithin30Days = daysUntilExpiry > 0 && daysUntilExpiry <= 30;
 
    onProgress(100, 'Done');
 
    return {
      success: true,
      rawText,
      // ── Fields consumed by Auth.jsx handleIeeeSignUp ──────────────────
      fullName,           // → meta.full_name  (user can edit in StepConfirm)
      memberId,           // → meta.membership_id
      expiryDate,         // → meta.membership_expiry (converted to ISO in Auth.jsx)
      subsection,         // → meta.subsection
      isIas,              // → meta.ias_status: isIas ? 'pending' : 'none'
      email,              // → extracted email if available
      // ── Advisory fields (shown in UI, not stored directly) ────────────
      isExpired,
      expiresWithin30Days,
      daysUntilExpiry,
    };
  } catch (err) {
    console.error('[OCR] Fatal error:', err);
    return {
      success: false,
      error:   'OCR failed: ' + (err?.message || 'Unknown error'),
    };
  }
}
 
/**
 * terminateOcrWorker()
 * Call on component unmount to release the Tesseract worker thread.
 */
export async function terminateOcrWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}