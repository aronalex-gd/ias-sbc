import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractCardData } from '../lib/ocr';

// ─── Visual States ────────────────────────────────────────────────────────────
const ProgressBar = ({ pct, label }) => (
  <div className="w-full">
    <div className="flex justify-between mb-1.5">
      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
      <span className="text-[10px] text-ias-green font-mono font-bold">{pct}%</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-ias-green rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ ease: 'easeOut', duration: 0.3 }}
      />
    </div>
  </div>
);

const ExtractedField = ({ label, value, mono = false, accent = false }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
    <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em]">{label}</span>
    <span
      className={`text-sm font-medium text-right max-w-[60%] ${
        mono ? 'font-mono text-ias-green text-xs' : accent ? 'text-ias-green' : 'text-white'
      }`}
    >
      {value}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * CardUploader
 *
 * Props:
 *   onExtracted(cardData) — called when OCR succeeds with the parsed data
 *   onReset()             — called when user clicks "Try Again"
 */
const CardUploader = ({ onExtracted, onReset }) => {
  const [phase, setPhase] = useState('idle'); // idle | scanning | success | error | expired
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [cardData, setCardData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a PDF, JPG, or PNG of your IEEE membership card.');
      setPhase('error');
      return;
    }

    setPhase('scanning');
    setProgress(0);

    const result = await extractCardData(file, (pct, label) => {
      setProgress(pct);
      setProgressLabel(label);
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Could not read the card. Please try again.');
      setPhase('error');
      return;
    }

    if (result.isExpired) {
      setCardData(result);
      setPhase('expired');
      return;
    }

    setCardData(result);
    setPhase('success');
    onExtracted(result);
  }, [onExtracted]);

  // Drag & drop
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const reset = () => {
    setPhase('idle');
    setCardData(null);
    setErrorMsg('');
    setProgress(0);
    if (onReset) onReset();
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (phase === 'idle') return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label
        className={`
          relative flex flex-col items-center justify-center gap-4 p-10
          rounded-3xl border-2 border-dashed cursor-pointer
          transition-all duration-200 group
          ${isDragging
            ? 'border-ias-green bg-ias-green/8 scale-[1.01]'
            : 'border-white/10 hover:border-ias-green/40 hover:bg-ias-green/4 bg-white/2'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragging ? 'bg-ias-green/20' : 'bg-white/5 group-hover:bg-ias-green/10'}`}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className={`transition-colors ${isDragging ? 'text-ias-green' : 'text-zinc-500 group-hover:text-ias-green'}`}>
            <path d="M14 4v14M8 12l6-8 6 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="text-center">
          <p className="font-bold text-white text-sm mb-1">Upload IEEE Membership Card</p>
          <p className="text-zinc-500 text-xs">Drag & drop or click to browse</p>
          <p className="text-zinc-600 text-[10px] mt-2 uppercase tracking-widest">PDF · JPG · PNG</p>
        </div>

        {/* IEEE badge */}
        <div className="absolute top-3 right-3 glass px-2 py-1 rounded-lg">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">IEEE Format</span>
        </div>
      </label>

      <p className="text-center mt-4 text-[10px] text-zinc-600 leading-relaxed">
        Your PDF is processed locally. We extract only your name, member ID, and expiry — the file is never uploaded or stored.
      </p>
    </motion.div>
  );

  // ── SCANNING ─────────────────────────────────────────────────────────────
  if (phase === 'scanning') return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 py-8"
    >
      {/* Animated scanner */}
      <div className="relative w-28 h-28">
        <div className="absolute inset-0 rounded-3xl border-2 border-ias-green/20" />
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-ias-green"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-ias-green">
            <rect x="4" y="8" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 16h28M10 11v2M10 23v2M26 11v2M26 23v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <motion.path
              d="M4 18h28"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-xs">
        <ProgressBar pct={progress} label={progressLabel || 'Initialising…'} />
      </div>

      <p className="text-zinc-500 text-xs text-center max-w-xs leading-relaxed">
        OCR is running on your device. This usually takes 10–20 seconds for a PDF.
      </p>
    </motion.div>
  );

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (phase === 'error') return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 py-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-400">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 7v6M12 15.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="text-center">
        <p className="font-bold text-white mb-2">Scan Failed</p>
        <p className="text-red-400/80 text-sm max-w-xs leading-relaxed">{errorMsg}</p>
      </div>
      <button onClick={reset} className="btn-ghost text-xs px-6 py-2.5">Try Again</button>
    </motion.div>
  );

  // ── EXPIRED ───────────────────────────────────────────────────────────────
  if (phase === 'expired') return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 py-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-yellow-400">
          <path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M12 9v5M12 16.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="text-center">
        <p className="font-bold text-white mb-2">Membership Expired</p>
        <p className="text-yellow-400/80 text-sm max-w-xs leading-relaxed">
          Your IEEE membership expired on{' '}
          {cardData?.expiryDate?.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}.
          Please renew at <a href="https://ieee.org/renew" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">ieee.org/renew</a> and then upload the new card.
        </p>
      </div>
      <button onClick={reset} className="btn-ghost text-xs px-6 py-2.5">Upload New Card</button>
    </motion.div>
  );

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (phase === 'success' && cardData) return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-ias-green/15 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5 6.5-7" stroke="#00D26A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-white text-sm">Card Read Successfully</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Data extracted</p>
        </div>
        <button onClick={reset} className="ml-auto text-zinc-600 hover:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Extracted data */}
      <div className="glass rounded-2xl p-4">
        <ExtractedField label="Full Name" value={cardData.fullName || '—'} />
        <ExtractedField label="Member ID" value={cardData.memberId} mono />
        <ExtractedField
          label="Expiry"
          value={
            cardData.expiryDate
              ? cardData.expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'
          }
          accent={cardData.expiresWithin30Days}
        />
        <ExtractedField label="Subsection" value={cardData.subsection || '—'} />
        <ExtractedField
          label="Membership Type"
          value={cardData.isIas ? 'IAS Member' : 'IEEE Member'}
          accent={cardData.isIas}
        />
      </div>

      {/* IAS notice */}
      {cardData.isIas && (
        <div className="flex gap-3 glass rounded-2xl p-4 border border-ias-green/15">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ias-green flex-shrink-0 mt-0.5">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <p className="text-ias-green/80 text-xs leading-relaxed">
            IAS membership detected. You'll be registered as an IEEE member first — your IAS status will be verified by an admin and upgraded automatically.
          </p>
        </div>
      )}

      {/* Expiry warning */}
      {cardData.expiresWithin30Days && (
        <div className="flex gap-3 glass rounded-2xl p-4 border border-yellow-500/15">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-yellow-400 flex-shrink-0 mt-0.5">
            <path d="M8 2L1 13h14L8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M8 6v4M8 11.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <p className="text-yellow-400/80 text-xs leading-relaxed">
            Your membership expires in <strong className="text-yellow-400">{cardData.daysUntilExpiry} days</strong>. Consider renewing soon.
          </p>
        </div>
      )}
    </motion.div>
  );

  return null;
};

export default CardUploader;
