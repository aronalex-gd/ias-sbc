/**
 * Register.jsx — Event registration with dual-membership entry logic
 *
 * Flow:
 *   ┌─ Not signed in ──────────────────────────── Prompt to sign in
 *   │
 *   ├─ Signed in, non_ieee_member ─────────────── Direct confirmation → Google Form
 *   │
 *   └─ Not registered (new IEEE / Non-IEEE) ───── MembershipGate
 *         ├─ "I am IEEE Member" → CardUploader → OCR → Confirm → upsert profile → Google Form
 *         └─ "I am Non-IEEE Member" → Google OAuth → upsert profile → Google Form
 *
 * Roles assigned: ieee_member (+ ias_status pending/none) | non_ieee_member
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import CardUploader from '../components/CardUploader';

// ─── Sub-step identifiers ──────────────────────────────────────────────────────
const GATE = {
  CHOICE:   'CHOICE',   // Choose IEEE or Non-IEEE
  OCR:      'OCR',      // Upload IEEE card
  CONFIRM:  'CONFIRM',  // Review extracted data + set credentials
  OAUTH:    'OAUTH',    // Non-IEEE: Google OAuth pending
  DONE:     'DONE',     // Registration submitted
};

// ─── Shared helpers ────────────────────────────────────────────────────────────
const Spinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className="w-8 h-8 border-2 border-ias-green/20 border-t-ias-green rounded-full"
  />
);

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0C0C0E]">
    <Spinner />
  </div>
);

const Field = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0">
    <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{label}</span>
    <span className={`text-sm text-white font-medium ${mono ? 'font-mono text-ias-green text-xs' : ''}`}>
      {value || '—'}
    </span>
  </div>
);

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

// ─── Gate: CHOICE ──────────────────────────────────────────────────────────────
const GateChoice = ({ onSelect }) => (
  <motion.div
    key="choice"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3 }}
    className="space-y-3"
  >
    <div className="mb-6">
      <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-1">One more step</p>
      <h2 className="font-display text-2xl text-white">Confirm Membership</h2>
      <p className="text-zinc-500 text-xs mt-1">Tell us about your IEEE status to complete registration.</p>
    </div>

    {/* IEEE track */}
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
            <p className="font-bold text-white text-sm">I am an IEEE Member</p>
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

    {/* Non-IEEE track */}
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
          <p className="font-bold text-white text-sm mb-1">I am a Non-IEEE Member</p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Sign up with Google — no IEEE card required. Register as a general member.
          </p>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-0.5">
          <path d="M4 7h6M8 5l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.button>
  </motion.div>
);

// ─── Gate: OCR (IEEE card upload) ──────────────────────────────────────────────
const GateOcr = ({ onExtracted, onBack }) => (
  <motion.div
    key="ocr"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    <button type="button" onClick={onBack} className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-6">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-[10px] uppercase tracking-widest">Back</span>
    </button>
    <div className="mb-6">
      <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-1">Step 1 of 2</p>
      <h2 className="font-display text-2xl text-white">Upload IEEE Card</h2>
      <p className="text-zinc-500 text-xs mt-1">We extract your details automatically.</p>
    </div>
    <CardUploader onExtracted={onExtracted} />
  </motion.div>
);

// ─── Gate: CONFIRM (review OCR data + set password) ───────────────────────────
const GateConfirm = ({ cardData, onSubmit, submitting, onBack }) => {
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
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-6">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[10px] uppercase tracking-widest">Back to upload</span>
      </button>

      <div className="mb-6">
        <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-1">Step 2 of 2</p>
        <h2 className="font-display text-2xl text-white">Confirm Details</h2>
        <p className="text-zinc-500 text-xs mt-1">Review the extracted data and create your account.</p>
      </div>

      {/* OCR data preview */}
      {cardData?.isIas && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-ias-green/8 border border-ias-green/20 rounded-xl">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ias-green flex-shrink-0">
            <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-ias-green text-[11px] font-bold">
            IAS membership detected — pending admin verification.
          </p>
        </div>
      )}

      <div className="glass rounded-2xl p-4 border border-white/5 mb-5 space-y-3">
        <Field label="Name"        value={cardData?.fullName} />
        <Field label="Member ID"   value={cardData?.memberId}   mono />
        <Field label="Subsection"  value={cardData?.subsection} />
        <Field label="Valid Until" value={
          cardData?.expiryDate instanceof Date
            ? cardData.expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
            : null
        } />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Full Name"
          placeholder="Edit if needed"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
        <InputField
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <InputField
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full justify-center"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          {submitting ? (
            <motion.div animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full mx-auto" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create Account & Register
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

// ─── Gate: OAUTH (Non-IEEE Google sign-in) ─────────────────────────────────────
const GateOAuth = ({ onGoogleSignIn, submitting, onBack }) => (
  <motion.div
    key="oauth"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    <button type="button" onClick={onBack} className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-6">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-[10px] uppercase tracking-widest">Back</span>
    </button>

    <div className="mb-8">
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.35em] mb-1">General Member</p>
      <h2 className="font-display text-2xl text-white">Sign up with Google</h2>
      <p className="text-zinc-500 text-xs mt-1">No IEEE card required. You'll be registered as a general member.</p>
    </div>

    <div className="glass rounded-2xl p-4 border border-white/5 mb-6 space-y-2">
      {[
        { icon: '✓', text: 'Access to all public events' },
        { icon: '✓', text: 'Event registration and notifications' },
        { icon: '✗', text: 'IAS exclusive sessions (IEEE only)', muted: true },
      ].map(({ icon, text, muted }) => (
        <div key={text} className="flex items-center gap-3">
          <span className={`text-xs font-bold ${muted ? 'text-zinc-700' : 'text-ias-green'}`}>{icon}</span>
          <span className={`text-xs ${muted ? 'text-zinc-700' : 'text-zinc-400'}`}>{text}</span>
        </div>
      ))}
    </div>

    <motion.button
      type="button"
      onClick={onGoogleSignIn}
      disabled={submitting}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white hover:bg-zinc-100 transition-colors text-black font-bold text-sm"
    >
      {submitting ? (
        <motion.div animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
      ) : (
        <>
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </>
      )}
    </motion.button>
  </motion.div>
);

// ─── Main Register Component ───────────────────────────────────────────────────
const Register = () => {
  const { id: eventId } = useParams();
  const navigate        = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const toast           = useToast();

  const [event,      setEvent]      = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Membership gate sub-step (only relevant when profile has no role yet)
  const [gateStep, setGateStep] = useState(GATE.CHOICE);
  const [cardData, setCardData] = useState(null);

  // ── Fetch event ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      setEvent(data);
      setPageLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const openGoogleForm = useCallback(() => {
    const fallback = 'https://forms.gle/your-link-here';
    const rawLink = event?.registration_link || fallback;
    const finalLink = rawLink.startsWith('http://') || rawLink.startsWith('https://') || rawLink.startsWith('/')
      ? rawLink
      : `https://${rawLink}`;
    window.open(finalLink, '_blank');
  }, [event]);

  // ── IEEE: OCR extracted → move to confirm ─────────────────────────────
  const handleExtracted = useCallback((data) => {
    setCardData(data);
    setGateStep(GATE.CONFIRM);
  }, []);

  // ── IEEE: create account + upsert profile + open form ─────────────────
  const handleIeeeSubmit = async ({ email, password, fullName }) => {
    if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (!fullName?.trim())   { toast.error('Please enter your full name.'); return; }
    setSubmitting(true);

    const d = cardData?.expiryDate;
    const expiryDate = d instanceof Date && !isNaN(d)
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : null;

    const meta = {
      full_name:         fullName.trim(),
      role:              'ieee_member',
      ias_status:        cardData?.isIas ? 'pending' : 'none',
      membership_id:     cardData?.memberId   || null,
      subsection:        cardData?.subsection || null,
      membership_expiry: expiryDate,
      is_guest:          false,
    };

    const { data: signupData, error } = await supabase.auth.signUp({
      email:    email.trim(),
      password,
      options:  { data: meta },
    });

    if (error) { toast.error(error.message); setSubmitting(false); return; }

    if (signupData?.session) {
      await refreshProfile();
      toast.success('Account created! Redirecting…');
      openGoogleForm();
      navigate('/profile');
    } else {
      toast.success('Check your email to confirm your account.');
      navigate('/auth');
    }
    setSubmitting(false);
  };

  // ── Non-IEEE: Google OAuth → role assigned via DB trigger ──────────────
  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/register/${eventId}`,
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
    if (error) { toast.error(error.message); setSubmitting(false); }
    // On success Supabase redirects — no manual navigate needed
  };

  // ── Direct registration for already-profiled users ─────────────────────
  const handleDirectRegister = () => {
    openGoogleForm();
  };

  // ── Loading states ─────────────────────────────────────────────────────
  if (authLoading || pageLoading) return <PageLoader />;

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0C0E] text-center px-6">
      <div className="glass rounded-3xl p-12">
        <span className="text-4xl block mb-4">🔍</span>
        <h2 className="font-display text-3xl text-white mb-2">Event Not Found</h2>
        <p className="text-zinc-500 text-sm">This event may have been removed or the link is invalid.</p>
      </div>
    </div>
  );

  // ── Determine if user needs to go through the membership gate ──────────
  // A user with an existing role (any role) skips the gate entirely
  const needsGate = !user || !profile?.role;

  return (
    <div className="min-h-screen bg-[#0C0C0E] pt-32 pb-20 px-6">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,210,106,0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key="register-shell"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Event banner */}
            {event.image_url && (
              <div className="w-full aspect-video rounded-3xl overflow-hidden mb-6 border border-white/5">
                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="glass rounded-3xl p-8 md:p-10 border border-white/5">
              <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-2">
                Event Registration
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-white mb-8 leading-tight">
                {event.title}
              </h1>

              {/* ── Case 1: Not signed in at all ── */}
              {!user && (
                <AnimatePresence mode="wait">
                  {gateStep === GATE.CHOICE && (
                    <GateChoice key="choice" onSelect={(track) => {
                      if (track === 'ieee')     setGateStep(GATE.OCR);
                      if (track === 'non_ieee') setGateStep(GATE.OAUTH);
                    }} />
                  )}
                  {gateStep === GATE.OCR && (
                    <GateOcr key="ocr" onExtracted={handleExtracted} onBack={() => setGateStep(GATE.CHOICE)} />
                  )}
                  {gateStep === GATE.CONFIRM && (
                    <GateConfirm key="confirm" cardData={cardData} onSubmit={handleIeeeSubmit} submitting={submitting} onBack={() => setGateStep(GATE.OCR)} />
                  )}
                  {gateStep === GATE.OAUTH && (
                    <GateOAuth key="oauth" onGoogleSignIn={handleGoogleSignIn} submitting={submitting} onBack={() => setGateStep(GATE.CHOICE)} />
                  )}
                </AnimatePresence>
              )}

              {/* ── Case 2: Signed in but no profile role yet (post-OAuth redirect) ── */}
              {user && !profile?.role && (
                <AnimatePresence mode="wait">
                  {gateStep === GATE.CHOICE && (
                    <GateChoice key="choice2" onSelect={(track) => {
                      if (track === 'ieee')     setGateStep(GATE.OCR);
                      if (track === 'non_ieee') {
                        // Already signed in via Google → just upsert role and proceed
                        (async () => {
                          setSubmitting(true);
                          await supabase.from('profiles').upsert({
                            id:              user.id,
                            role:            'non_ieee_member',
                            ias_status:      'none',
                            is_guest:        true,
                            membership_id:   null,
                            membership_expiry: null,
                            subsection:      null,
                          }, { onConflict: 'id' });
                          await refreshProfile();
                          openGoogleForm();
                          setSubmitting(false);
                        })();
                      }
                    }} />
                  )}
                  {gateStep === GATE.OCR && (
                    <GateOcr key="ocr2" onExtracted={handleExtracted} onBack={() => setGateStep(GATE.CHOICE)} />
                  )}
                  {gateStep === GATE.CONFIRM && (
                    <GateConfirm key="confirm2" cardData={cardData} onSubmit={handleIeeeSubmit} submitting={submitting} onBack={() => setGateStep(GATE.OCR)} />
                  )}
                </AnimatePresence>
              )}

              {/* ── Case 3: Signed in with established role → direct confirm ── */}
              {user && profile?.role && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="direct-confirm"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Role badge */}
                    <div className="mb-5 flex items-center gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        profile.role === 'ieee_ias_member' ? 'text-ias-green bg-ias-green/10 border-ias-green/20' :
                        profile.role === 'ieee_member'     ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                        profile.role === 'admin'           ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' :
                        'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
                      }`}>
                        {profile.role === 'ieee_ias_member' ? 'IAS Member'    :
                         profile.role === 'ieee_member'     ? 'IEEE Member'   :
                         profile.role === 'admin'           ? 'Admin'         :
                         'General Member'}
                      </span>
                      {profile.ias_status === 'pending' && (
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border text-yellow-400 bg-yellow-400/10 border-yellow-400/20">
                          IAS Pending
                        </span>
                      )}
                    </div>

                    {/* Registration summary */}
                    <div className="space-y-3 mb-8">
                      {[
                        { label: 'Participant', value: profile.full_name },
                        { label: 'Email',       value: profile.email },
                        { label: 'Member ID',   value: profile.membership_id || 'N/A', mono: !!profile.membership_id },
                        {
                          label: 'Date',
                          value: new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                          }),
                        },
                        event.location && { label: 'Location', value: event.location },
                      ].filter(Boolean).map(({ label, value, mono }, i) => (
                        <Field key={i} label={label} value={value} mono={mono} />
                      ))}
                    </div>

                    <motion.button
                      onClick={handleDirectRegister}
                      className="btn-primary w-full"
                      style={{ paddingTop: 18, paddingBottom: 18 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex justify-center items-center gap-2">
                        Register via Google Forms
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M1 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </motion.button>

                    <p className="text-center text-[10px] text-zinc-700 mt-4">
                      You'll be redirected to the event registration form.
                    </p>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;