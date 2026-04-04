import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import CardUploader from '../components/CardUploader';

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

const SignUpStep1 = ({ onExtracted }) => (
  <div>
    <div className="mb-6">
      <h1 className="text-2xl font-black text-white tracking-tight mb-1">Upload Your IEEE Card</h1>
      <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">We extract your details automatically</p>
    </div>
    <CardUploader onExtracted={onExtracted} />
  </div>
);

const SignUpStep2 = ({ cardData, onSubmit, loading }) => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState(cardData?.fullName || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password, fullName });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white tracking-tight mb-1">Confirm & Create Account</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Review your extracted details</p>
      </div>

      <div className="glass rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-ias-green" />
          <span className="text-[10px] text-ias-green font-bold uppercase tracking-widest">Extracted from your IEEE card</span>
        </div>
        {[
          { label: 'Member ID', value: cardData.memberId, mono: true },
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
        <InputField label="Full Name *" type="text" placeholder="Your full name as on IEEE card" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
        <InputField label="Email Address *" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <InputField label="Create Password *" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />

        {cardData.isIas && (
          <div className="flex gap-3 glass rounded-2xl p-3 border border-ias-green/15">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ias-green shrink-0 mt-0.5">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4.5v3M7 9v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <p className="text-ias-green/70 text-[10px] leading-relaxed">
              IAS membership detected. You'll start as an IEEE member — an admin will verify and upgrade your IAS status.
            </p>
          </div>
        )}

        <motion.button type="submit" disabled={loading || !fullName.trim()} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed" style={{ paddingTop: 16, paddingBottom: 16 }}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />
              Creating Account…
            </span>
          ) : 'Create Account'}
        </motion.button>
      </form>
    </motion.div>
  );
};

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const navigate = useNavigate();
  const toast = useToast();

  const handleExtracted = (data) => {
    setCardData(data);
    setSignUpStep(2);
  };

  const handleSignUp = async ({ email, password, fullName }) => {
    if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (!fullName?.trim()) { toast.error('Please enter your full name.'); return; }

    setLoading(true);

    // 1. Format date safely for Postgres DATE type (using local time to avoid off-by-one errors)
    const d = cardData?.expiryDate;
    const expiryDate = d instanceof Date && !isNaN(d)
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      : null;

    // 2. Align metadata with your Table Constraints
    const meta = { 
      full_name: fullName.trim(), 
      role: 'ieee_member', 
      ias_status: cardData.isIas ? 'pending' : 'none',
      membership_id: cardData.memberId || null,
      subsection: cardData.subsection || 'Kochi',
      membership_expiry: expiryDate
    };

    const { data: signupData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: meta },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // 3. Logic Fix: Redirect immediately if session exists, or notify to check email
    if (signupData?.session) {
      toast.success('Welcome to IAS!');
      navigate('/profile');
    } else {
      toast.success('Account created! Please check your email for confirmation.');
      setIsSignUp(false); // Move user to login view
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
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

  const resetSignUp = () => {
    setSignUpStep(1);
    setCardData(null);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 pt-20 pb-12">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-ias-green/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-3xl border border-white/6 overflow-hidden shadow-2xl shadow-black/80 relative z-10">
        <div className="hidden md:flex flex-col justify-between p-12 bg-linear-to-br from-[#0e1a14] to-surface border-r border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-ias-green/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-ias-green/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 relative z-10">
            
            <span className="text-white font-bold text-sm">IEEE IAS JECC</span>
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-6xl text-white leading-none mb-4">JOIN THE<br /><span className="text-ias-green">INDUSTRY</span><br />ELITE.</h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">Upload your IEEE card — we extract everything automatically. Just confirm your name and set a password.</p>
          </div>
          <div className="relative z-10 space-y-3">
            {[{ step: '01', text: 'Upload your IEEE membership PDF' }, { step: '02', text: 'Confirm your name & set password' }, { step: '03', text: 'Your account is created instantly' }].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-ias-green/15 flex items-center justify-center shrink-0"><span className="text-ias-green text-[9px] font-bold">{step}</span></div>
                <span className="text-zinc-400 text-xs">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12 bg-[#0F0F12] overflow-y-auto max-h-screen">
          <div className="flex mb-8 p-1 glass rounded-2xl border border-white/5">
            {['Sign In', 'Sign Up'].map((label, i) => (
              <motion.button key={label} type="button" onClick={() => { setIsSignUp(i === 1); resetSignUp(); }} whileTap={{ scale: 0.97 }} className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all ${isSignUp === (i === 1) ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {!isSignUp ? (
              <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.25 }}>
                <div className="mb-8">
                  <h1 className="text-2xl font-black text-white tracking-tight mb-1">Welcome Back</h1>
                  <p className="text-zinc-500 text-xs uppercase tracking-[0.2em]">Enter your credentials</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField label="Email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required autoComplete="email" />
                  <InputField label="Password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required autoComplete="current-password" />
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="btn-primary w-full" style={{ paddingTop: 16, paddingBottom: 16 }}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />
                        Signing In…
                      </span>
                    ) : 'Sign In'}
                  </motion.button>
                </form>
              </motion.div>
            ) : signUpStep === 1 ? (
              <motion.div key="signup-1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
                <SignUpStep1 onExtracted={handleExtracted} />
              </motion.div>
            ) : (
              <motion.div key="signup-2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
                <div className="flex items-center gap-2 mb-5">
                  <button onClick={resetSignUp} className="text-zinc-600 hover:text-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Back to upload</span>
                </div>
                <SignUpStep2 cardData={cardData} onSubmit={handleSignUp} loading={loading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;