/**
 * Auth.jsx — Dual-track authentication with state machine architecture
 *
 * State Machine:
 *   SELECTION → (IEEE) → PROCESS → CONFIRM
 *   SELECTION → (NON_IEEE) → OAUTH
 *
 * Membership Tracks:
 *   IEEE     : OCR card upload → confirm → Supabase signUp with full metadata
 *   Non-IEEE : Google OAuth → Supabase signUp with guest role, null IEEE fields
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import CardUploader from '../components/CardUploader';
import { useAuth } from '../context/AuthContext';

// ─── Auth State Machine Steps ─────────────────────────────────────────────────
const STEP = {
  SELECTION: 'SELECTION',  // Choose IEEE or Non-IEEE
  PROCESS:   'PROCESS',    // IEEE: OCR upload
  CONFIRM:   'CONFIRM',    // IEEE: review + credentials
  OAUTH:     'OAUTH',      // Non-IEEE: Google OAuth pending
};

// ─── Shared Input Field ───────────────────────────────────────────────────────
const InputField = ({ label, type = 'text', placeholder, value, onChange, required, autoComplete }) => (
  <div>
    {label && (
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2 pl-1">
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
      className="input-field"
    />
  </div>
);

// ─── Step: SELECTION ─────────────────────────────────────────────────────────
const StepSelection = ({ onSelect }) => (
  <motion.div
    key="selection"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mb-8">
      <h1 className="text-2xl font-black text-white tracking-tight mb-1">Create Account</h1>
      <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Choose your membership type</p>
    </div>

    <div className="space-y-3">
      {/* IEEE Track */}
      <motion.button
        type="button"
        onClick={() => onSelect('ieee')}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full text-left glass rounded-2xl p-5 border border-white/8 hover:border-ias-green/40 transition-all group relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-ias-green/8 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-ias-green/10 border border-ias-green/20 flex items-center justify-center flex-shrink-0 group-hover:bg-ias-green/20 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-ias-green">
              <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2 8h14M6 4v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-white text-sm">IEEE Member</p>
              <span className="text-[9px] font-bold uppercase tracking-widest text-ias-green bg-ias-green/10 px-2 py-0.5 rounded-full border border-ias-green/20">
                Recommended
              </span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Upload your IEEE membership card — we extract your details automatically via OCR.
            </p>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-600 group-hover:text-ias-green transition-colors flex-shrink-0 mt-0.5">
            <path d="M4 7h6M8 5l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.button>

      {/* Non-IEEE Track */}
      <motion.button
        type="button"
        onClick={() => onSelect('non_ieee')}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full text-left glass rounded-2xl p-5 border border-white/8 hover:border-white/20 transition-all group relative overflow-hidden"
      >
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/8 transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-zinc-400">
              <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M3 15c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-white text-sm mb-1">General Member</p>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Sign up with Google — no IEEE card required. Join as a guest member.
            </p>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-0.5">
            <path d="M4 7h6M8 5l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.button>
    </div>

    <p className="text-center text-[10px] text-zinc-600 mt-6 leading-relaxed">
      IEEE members get full access including IAS verification and digital membership cards.
    </p>
  </motion.div>
);

// ─── Step: PROCESS (IEEE OCR Upload) ─────────────────────────────────────────
const StepProcess = ({ onExtracted, onBack }) => (
  <motion.div
    key="process"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center gap-2 mb-6">
      <button type="button" onClick={onBack} className="text-zinc-600 hover:text-white transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Back to selection</span>
    </div>

    <div className="mb-6">
      <h1 className="text-2xl font-black text-white tracking-tight mb-1">Upload IEEE Card</h1>
      <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">We extract your details automatically</p>
    </div>

    <CardUploader onExtracted={onExtracted} />
  </motion.div>
);

// ─── Step: CONFIRM (IEEE — review + credentials) ──────────────────────────────
const StepConfirm = ({ cardData, onSubmit, loading, onBack }) => {
  const [password, setPassword] = useState('');
  const [email, setEmail]       = useState(cardData?.email || '');
  const [fullName, setFullName] = useState(cardData?.fullName || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password, fullName });
  };

  return (
    <motion.div
      key="confirm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <button type="button" onClick={onBack} className="text-zinc-600 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Back to upload</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight mb-1">Confirm & Create Account</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Review your extracted details</p>
      </div>

      {/* Extracted card data preview */}
      <div className="glass rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-ias-green" />
          <span className="text-[10px] text-ias-green font-bold uppercase tracking-widest">Extracted from IEEE card</span>
        </div>
        {[
          { label: 'Member ID',  value: cardData.memberId,   mono: true },
          { label: 'Subsection', value: cardData.subsection },
          {
            label: 'Expiry',
            value: cardData.expiryDate
              ? cardData.expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—',
          },
          {
            label: 'Type',
            value: cardData.isIas ? 'IAS Member (pending verification)' : 'IEEE Member',
            accent: cardData.isIas,
          },
        ].map(({ label, value, mono, accent }) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{label}</span>
            <span className={`text-xs text-right max-w-[60%] font-medium ${mono ? 'font-mono text-ias-green' : accent ? 'text-ias-green' : 'text-white'}`}>
              {value || '—'}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Full Name *"
          placeholder="Your full name as on IEEE card"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
        <InputField
          label="Email Address *"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <InputField
          label="Create Password *"
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        {cardData.isIas && (
          <div className="flex gap-3 glass rounded-2xl p-3 border border-ias-green/15">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ias-green shrink-0 mt-0.5">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4.5v3M7 9v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <p className="text-ias-green/70 text-[10px] leading-relaxed">
              IAS membership detected. You'll start as an IEEE member — an admin will verify and upgrade your IAS status shortly.
            </p>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={loading || !fullName.trim()}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
              />
              Creating Account…
            </span>
          ) : 'Create Account →'}
        </motion.button>
      </form>
    </motion.div>
  );
};

// ─── Step: OAUTH (Non-IEEE Google Sign-in) ────────────────────────────────────
const StepOAuth = ({ onBack, loading, onGoogleSignIn }) => (
  <motion.div
    key="oauth"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col"
  >
    <div className="flex items-center gap-2 mb-6">
      <button type="button" onClick={onBack} className="text-zinc-600 hover:text-white transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Back to selection</span>
    </div>

    <div className="mb-8">
      <h1 className="text-2xl font-black text-white tracking-tight mb-1">Join as Guest</h1>
      <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Continue with your Google account</p>
    </div>

    {/* Guest scope notice */}
    <div className="glass rounded-2xl p-4 mb-6 border border-white/8">
      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-3">Guest Member Access</p>
      {[
        { label: 'Event listings & registration', enabled: true },
        { label: 'Community resources', enabled: true },
        { label: 'Digital IEEE membership card', enabled: false },
        { label: 'IAS premium card & verification', enabled: false },
      ].map(({ label, enabled }) => (
        <div key={label} className="flex items-center gap-2.5 py-1.5">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-ias-green/15' : 'bg-white/5'}`}>
            {enabled ? (
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1 3.5l2 2 3-3" stroke="#00D26A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1.5 1.5l4 4M5.5 1.5l-4 4" stroke="#52525B" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <span className={`text-xs ${enabled ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
        </div>
      ))}
    </div>

    <motion.button
      type="button"
      onClick={onGoogleSignIn}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-zinc-100 transition-colors disabled:opacity-60"
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
        />
      ) : (
        <>
          {/* Google "G" icon */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </>
      )}
    </motion.button>

    <p className="text-center text-[10px] text-zinc-600 mt-4 leading-relaxed">
      You can upgrade to an IEEE member account later by contacting an admin.
    </p>
  </motion.div>
);

// ─── Sign-In Form ─────────────────────────────────────────────────────────────
const SignInForm = ({ onSubmit, loading }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight mb-1">Welcome Back</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Enter your credentials</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password }); }} className="space-y-4">
        <InputField label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <InputField label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="btn-primary w-full"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />
              Signing In…
            </span>
          ) : 'Sign In →'}
        </motion.button>
      </form>
    </motion.div>
  );
};

// ─── Main Auth Page ───────────────────────────────────────────────────────────
const Auth = () => {
  const { user } = useAuth();
  const [mode, setMode]       = useState('login'); // login | signup
  const [step, setStep]       = useState(STEP.SELECTION);
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const toast    = useToast();

  useEffect(() => {
    if (user) {
      navigate('/profile', { replace: true });
    }
  }, [user, navigate]);

  // Reset the signup state machine
  const resetSignup = useCallback(() => {
    setStep(STEP.SELECTION);
    setCardData(null);
  }, []);

  const switchMode = (m) => {
    setMode(m);
    resetSignup();
  };

  // ── OCR extracted → move to CONFIRM ──────────────────────────────────────
  const handleExtracted = useCallback((data) => {
    setCardData(data);
    setStep(STEP.CONFIRM);
  }, []);

  // ── Normalize & submit IEEE sign-up ──────────────────────────────────────
  const handleIeeeSignUp = async ({ email, password, fullName }) => {
    if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (!fullName?.trim())   { toast.error('Please enter your full name.'); return; }

    setLoading(true);

    // Safe ISO date string using local time (avoids off-by-one UTC issues)
    const d = cardData?.expiryDate;
    const expiryDate = d instanceof Date && !isNaN(d)
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : null;

    // Normalized metadata for IEEE track
    const meta = {
      full_name:          fullName.trim(),
      role:               'ieee_member',
      ias_status:         cardData.isIas ? 'pending' : 'none',
      membership_id:      cardData.memberId   || null,
      subsection:         cardData.subsection || null,
      membership_expiry:  expiryDate,
      // Guest fields explicitly null for IEEE track
      is_guest:           false,
    };

    const { data: signupData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: meta },
    });

    if (error) { toast.error(error.message); setLoading(false); return; }

    if (signupData?.session) {
      toast.success('Welcome to IEEE IAS!');
      navigate('/profile');
    } else {
      toast.success('Account created! Check your email for confirmation.');
      switchMode('login');
    }
    setLoading(false);
  };

  // ── Non-IEEE Google OAuth sign-up ────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`,
        // Pass guest metadata through query params or handle via DB trigger
        queryParams: { access_type: 'offline', prompt: 'consent' },
        data: {
          role:              'non_ieee_member',
          is_guest:          true,
          membership_id:     null,
          membership_expiry: null,
          subsection:        null,
          ias_status:        'none',
        },
      },
    });
    if (error) { toast.error(error.message); setLoading(false); }
    // On success, Supabase redirects — no need to navigate manually
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login') || error.message.includes('Invalid credentials')) {
        toast.error('Incorrect email or password.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please verify your email before logging in.');
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    if (data?.session) {
      toast.success('Welcome back!');
      navigate('/profile');
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 pt-20 pb-12">
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-ias-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-3xl border border-white/6 overflow-hidden shadow-2xl shadow-black/80 relative z-10">
        {/* ── Left panel (decorative) ──────────────────────────────────────── */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-linear-to-br from-[#0e1a14] to-surface border-r border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-ias-green/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-ias-green/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 relative z-10">
            <span className="text-white font-bold text-sm">IEEE IAS JECC</span>
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-6xl text-white leading-none mb-4">
              JOIN THE<br /><span className="text-ias-green">INDUSTRY</span><br />ELITE.
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              IEEE members upload their card for instant verification. Non-IEEE members can join as guests via Google.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              { step: '01', text: 'Choose your membership type' },
              { step: '02', text: 'Upload IEEE card or sign in with Google' },
              { step: '03', text: 'Your account is created instantly' },
            ].map(({ step: s, text }) => (
              <div key={s} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-ias-green/15 flex items-center justify-center shrink-0">
                  <span className="text-ias-green text-[9px] font-bold">{s}</span>
                </div>
                <span className="text-zinc-400 text-xs">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel (auth forms) ─────────────────────────────────────── */}
        <div className="p-8 md:p-12 bg-[#0F0F12] overflow-y-auto max-h-screen">
          {/* Mode toggle */}
          <div className="flex mb-8 p-1 glass rounded-2xl border border-white/5">
            {['Sign In', 'Sign Up'].map((label, i) => (
              <motion.button
                key={label}
                type="button"
                onClick={() => switchMode(i === 0 ? 'login' : 'signup')}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                  mode === (i === 0 ? 'login' : 'signup')
                    ? 'bg-white text-black'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <SignInForm key="login" onSubmit={handleLogin} loading={loading} />
            ) : step === STEP.SELECTION ? (
              <StepSelection key="selection" onSelect={(track) => {
                if (track === 'ieee')      setStep(STEP.PROCESS);
                if (track === 'non_ieee')  setStep(STEP.OAUTH);
              }} />
            ) : step === STEP.PROCESS ? (
              <StepProcess key="process" onExtracted={handleExtracted} onBack={() => setStep(STEP.SELECTION)} />
            ) : step === STEP.CONFIRM ? (
              <StepConfirm key="confirm" cardData={cardData} onSubmit={handleIeeeSignUp} loading={loading} onBack={() => setStep(STEP.PROCESS)} />
            ) : step === STEP.OAUTH ? (
              <StepOAuth key="oauth" loading={loading} onGoogleSignIn={handleGoogleSignIn} onBack={() => setStep(STEP.SELECTION)} />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;