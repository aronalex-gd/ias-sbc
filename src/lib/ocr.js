/**
 * IEEE Membership Card OCR Engine
 *
 * Pipeline:
 *  1. Convert PDF page → <canvas> via pdf.js
 *  2. Pre-process canvas (scale ×3, grayscale, contrast boost)
 *  3. Run Tesseract.js on the processed image blob
 *  4. Parse extracted text with targeted regexes
 *  5. Validate the card structure (IEEE keywords, expiry date)
 */

// ─── PDF.js via CDN (loaded lazily) ──────────────────────────────────────────
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

// ─── Canvas pre-processing ────────────────────────────────────────────────────
async function pdfToPreprocessedBlob(file, scaleFactor = 3) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await getPdfJs();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: scaleFactor });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;

  // Grayscale + contrast boost
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrasted = Math.min(255, Math.max(0, (gray - 128) * 1.6 + 128));
    data[i] = data[i + 1] = data[i + 2] = contrasted;
  }
  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

// ─── Tesseract worker ─────────────────────────────────────────────────────────
let worker = null;
async function getWorker() {
  if (worker) return worker;
  const { createWorker } = await import('tesseract.js');
  worker = await createWorker('eng', 1, {
    tessedit_pageseg_mode: '1',
    tessedit_char_whitelist:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 #./,-',
  });
  return worker;
}

// ─── Parsers ─────────────────────────────────────────────────────────────────
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

function extractFullName(text) {
  // Remove known boilerplate that looks like a name but is just a sentence
  const cleanText = text
    .replace(/You Can Achieve Great Things\.?/gi, '')
    .replace(/Thank You for Your Membership!?/gi, '')
    .replace(/Make the Most of Your Membership\.?/gi, '')
    .replace(/Industry Applications Society/gi, '')
    .replace(/Below is a digital version.*?anytime!/gis, '');

  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Strategy 1: Look right above the Member # line
  const memberLineIdx = lines.findIndex((l) => /Member\s*#/i.test(l));

  if (memberLineIdx > 0) {
    // Check up to 3 lines above the Member number
    for (let i = memberLineIdx - 1; i >= Math.max(0, memberLineIdx - 3); i--) {
      const candidate = lines[i];

      // Try to extract an ALL CAPS name (e.g. ARON ALEX) even if trailing text exists
      const capsMatch = candidate.match(/^([A-Z][A-Z\s\.\-]{2,30}[A-Z])(?=\s|$)/);
      if (capsMatch && !/STUDENT|MEMBER|IEEE|VALID/i.test(capsMatch[1])) {
        return capsMatch[1].trim();
      }

      // Try to extract a Title Case name
      const titleMatch = candidate.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?=\s|$)/);
      if (titleMatch && !/Student|Member|Ieee/i.test(titleMatch[1])) {
        return titleMatch[1].trim();
      }

      // Fallback: If the whole line is just letters/spaces (max 40 chars)
      if (
        /^[A-Za-z][A-Za-z\s\.\-]{2,39}$/.test(candidate) &&
        !/Student|Member|IEEE/i.test(candidate)
      ) {
        return candidate.trim();
      }
    }
  }

  // Strategy 2: Explicitly hunt for 2 to 4 ALL CAPS words grouped together anywhere
  for (const line of lines) {
    const capsMatch = line.match(/\b([A-Z][A-Z\.\-]*\s+[A-Z][A-Z\s\.\-]{2,30}[A-Z])\b/);
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

  // Strategy 3: Just fallback to something that looks like Title Case
  for (const line of lines) {
    if (
      /^([A-Z][A-Za-z\.\-]{1,20}\s+){1,3}[A-Z][A-Za-z\.\-]{1,20}$/.test(line) &&
      !/IEEE|Member|Valid|You|Below|Great|Things|Thank|Section|Branch|Technical|Publications|Career|Professional/i.test(line)
    ) {
      return line.trim();
    }
  }

  return null;
}

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

function extractSubsection(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const memberLineIdx = lines.findIndex((l) => /Member\s*#/i.test(l));

  if (memberLineIdx >= 0 && memberLineIdx < lines.length - 1) {
    // Look up to 4 lines below the Membership ID line
    for (let i = memberLineIdx + 1; i <= Math.min(memberLineIdx + 4, lines.length - 1); i++) {
      const candidate = lines[i];
      const m = candidate.match(/([A-Za-z\s]+)Subsection/i);
      if (m) {
        return m[1].replace(/Location:\s*/i, '').trim();
      }
      const locMatch = candidate.match(/Location:\s*([A-Za-z]+)/i);
      if (locMatch) {
         return locMatch[1].trim();
      }
    }
  }

  // Fallback if not found near Member number
  const m = text.match(/([A-Za-z\s]+)Subsection/i);
  if (m) {
    return m[1].replace(/Location:\s*/i, '').trim();
  }
  const locMatch = text.match(/Location:\s*([A-Za-z]+)/i);
  return locMatch ? locMatch[1].trim() : null;
}

function detectIasMembership(text) {
  return (
    /Industry\s+Applications\s+Society/i.test(text) ||
    /\bIAS\b/.test(text) ||
    /IAS\s+Member/i.test(text)
  );
}

function validateCardStructure(text) {
  const missing = ['IEEE', 'Member'].filter(
    (kw) => !new RegExp(kw, 'i').test(text)
  );
  if (missing.length > 0) {
    return {
      valid: false,
      reason: `Not a valid IEEE card — missing: ${missing.join(', ')}.`,
    };
  }
  if (!/\d{8,10}/.test(text)) {
    return {
      valid: false,
      reason: 'No member number found. Please upload your official IEEE card.',
    };
  }
  return { valid: true, reason: 'OK' };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function extractCardData(file, onProgress = () => {}) {
  try {
    onProgress(5, 'Loading PDF renderer…');
    let imageBlob;

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      onProgress(15, 'Rendering PDF page…');
      imageBlob = await pdfToPreprocessedBlob(file, 3);
    } else {
      imageBlob = file;
    }

    onProgress(50, 'Running OCR (this takes ~10 s)…');
    const w = await getWorker();
    const { data } = await w.recognize(imageBlob);
    const rawText = data.text;

    onProgress(80, 'Parsing membership data…');

    const validation = validateCardStructure(rawText);
    if (!validation.valid) {
      return { success: false, error: validation.reason, rawText };
    }

    const memberId   = extractMemberId(rawText);
    const fullName   = extractFullName(rawText);
    const expiryDate = extractExpiryDate(rawText);
    const subsection = extractSubsection(rawText);
    const isIas      = detectIasMembership(rawText);

    if (!memberId) {
      return {
        success: false,
        error: 'Could not read Member ID. Try a clearer scan.',
        rawText,
      };
    }

    const now = new Date();
    const isExpired = expiryDate ? expiryDate < now : false;

    if (!fullName || !memberId || !expiryDate || !subsection || isExpired) {
      return {
        success: false,
        error: "Invalid PDF or Membership Expired. Please upload a valid IEEE card.",
        rawText
      };
    }

    const daysUntilExpiry = expiryDate
      ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
      : null;
    const expiresWithin30Days =
      daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30;

    onProgress(100, 'Done');

    return {
      success: true,
      rawText,
      fullName: fullName,
      memberId,
      expiryDate,
      subsection: subsection,
      isIas,
      isExpired,
      expiresWithin30Days,
      daysUntilExpiry,
    };
  } catch (err) {
    console.error('[OCR] Fatal error:', err);
    return {
      success: false,
      error: 'OCR failed: ' + (err.message || 'Unknown error'),
    };
  }
}

export async function terminateOcrWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
