import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import MemberCard from '../components/MemberCard';
import { ProfileSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';

const StatusBadge = ({ role, iasPending }) => {
  const cfg =
    role === 'ieee_ias_member'
      ? { label: 'IAS Member · Verified', cls: 'bg-ias-green/10 text-ias-green border-ias-green/20', dot: 'bg-ias-green animate-pulse' }
      : iasPending === true
      ? { label: 'IAS Pending Verification', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' }
      : { label: 'IEEE Member', cls: 'bg-white/5 text-white/60 border-white/10', dot: 'bg-zinc-500' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const ExpiryAlert = ({ membershipExpiry }) => {
  if (!membershipExpiry) return null;
  const expiry = new Date(membershipExpiry);
  const now = new Date();
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (daysLeft > 30) return null;

  const isExpired = daysLeft < 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-4 border flex gap-3 items-start ${
        isExpired ? 'border-red-500/20' : 'border-yellow-500/20'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
        className={`flex-shrink-0 mt-0.5 ${isExpired ? 'text-red-400' : 'text-yellow-400'}`}>
        <path d="M8 1.5L1 13.5h14L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M8 6v4M8 11.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <div>
        <p className={`text-xs font-bold mb-0.5 ${isExpired ? 'text-red-400' : 'text-yellow-400'}`}>
          {isExpired ? 'Membership Expired' : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
        </p>
        <p className={`text-[11px] ${isExpired ? 'text-red-400/60' : 'text-yellow-400/60'}`}>
          {isExpired
            ? 'Your membership has expired. Renew at ieee.org/renew.'
            : `Renew before ${expiry.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}.`}
          {' '}
          <a href="https://ieee.org/renew" target="_blank" rel="noopener noreferrer"
            className="underline hover:no-underline">Renew →</a>
        </p>
      </div>
    </motion.div>
  );
};

const IasVerificationPrompt = ({ userId, onRequested }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleRequest = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ ias_pending: true })
      .eq('id', userId);
    
    if (error) {
      toast.error('Failed to request verification: ' + error.message);
    } else {
      toast.success('Verification requested! Admin will review your profile.');
      onRequested();
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 border border-ias-green/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-ias-green/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <p className="text-xs font-bold text-ias-green mb-0.5">Are you an IAS Member?</p>
          <p className="text-[11px] text-zinc-400">Request verification to unlock your premium digital card.</p>
        </div>
        <button 
          onClick={handleRequest}
          disabled={loading}
          className="px-4 py-2 bg-ias-green/10 text-ias-green border border-ias-green/20 hover:bg-ias-green/20 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-colors flex-shrink-0 whitespace-nowrap"
        >
          {loading ? 'Requesting...' : 'Request Verification'}
        </button>
      </div>
    </motion.div>
  );
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCardView, setActiveCardView] = useState('ias');
  const toast = useToast();

  useEffect(() => {
    let subscription;

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (error) {
          console.error("Profile fetch error:", error.message);
          return;
        }

        if (data) setProfile(data);
        else {
          toast.error("Profile not found. Please try re-signing up.");
        }

        subscription = supabase.channel('public:profiles')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
            setProfile(payload.new);
          })
          .subscribe();
      }
      setLoading(false);
    };
    fetchProfile();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.info('Signed out.');
  };

  if (loading) return <ProfileSkeleton />;

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0C0C0E] text-center px-6">
      <div className="glass rounded-3xl p-12 max-w-sm">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-display text-3xl text-white mb-2">Not Signed In</h2>
        <a href="/auth" className="btn-primary mt-4 inline-block">Sign In</a>
      </div>
    </div>
  );

  const infoRows = [
    { label: 'Full Name', value: profile.full_name },
    { label: 'Email', value: profile.email },
    { label: 'Member ID', value: profile.membership_id || '—', mono: true },
    { label: 'IAS Status', value: <StatusBadge role={profile.role} iasPending={profile.ias_pending} /> },
    { label: 'Subsection', value: profile.subsection || 'Data not found' },
    {
      label: 'Valid Through',
      value: profile.membership_expiry
        ? new Date(profile.membership_expiry).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—',
    },
  ];

  const isIasVerified = profile?.role === 'ieee_ias_member';
  const displayRole = isIasVerified && activeCardView === 'ieee' ? 'ieee_member' : profile.role;

  return (
    <div className="min-h-screen bg-[#0C0C0E] pt-32 pb-20 px-6 overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,210,106,0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <StatusBadge role={profile.role} iasPending={profile.ias_pending} />
          <h1 className="font-display text-6xl md:text-8xl text-white mt-4 mb-1 leading-none">
            MEMBER <span className="text-ias-green">ID</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.5em]">Verified Student Personnel</p>
        </motion.div>

        {/* Main layout */}
        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-3 flex flex-col items-center"
          >
            {isIasVerified && (
              <div className="flex justify-center gap-2 mb-6 p-1 glass rounded-2xl border border-white/5 w-fit">
                <button 
                  onClick={() => setActiveCardView('ieee')}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeCardView === 'ieee' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  IEEE Card
                </button>
                <button 
                  onClick={() => setActiveCardView('ias')}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                    activeCardView === 'ias' ? 'bg-ias-green text-black' : 'text-zinc-500 hover:text-ias-green'
                  }`}
                >
                  IAS Premium
                  {activeCardView === 'ias' && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  )}
                </button>
              </div>
            )}
            <MemberCard
              name={profile.full_name}
              memberId={profile.membership_id}
              role={displayRole}
              iasPending={profile.ias_pending}
              subsection={profile.subsection}
              membershipExpiry={profile.membership_expiry}
            />
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2 space-y-4"
          >
            {/* Expiry alert */}
            <ExpiryAlert membershipExpiry={profile.membership_expiry} />

            {/* IAS Verification Prompt / Pending Notice */}
            {profile.role === 'ieee_member' && profile.ias_pending === false && (
              <IasVerificationPrompt 
                userId={profile.id} 
                onRequested={() => setProfile(prev => ({ ...prev, ias_pending: true }))} 
              />
            )}

            {profile.role !== 'ieee_ias_member' && profile.ias_pending === true && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-4 border border-ias-green/15"
              >
                <div className="flex gap-3">
                  <motion.svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className="flex-shrink-0 mt-0.5 text-ias-green"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 2"/>
                  </motion.svg>
                  <p className="text-ias-green/70 text-xs leading-relaxed">
                    Your IAS membership is under admin review. Your card will automatically upgrade once verified.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Details */}
            <div className="glass rounded-3xl p-5">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-4">Profile Details</h3>
              <div className="space-y-0">
                {infoRows.map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between items-center border-b border-white/5 py-3 last:border-0">
                     <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{label}</span>
                    <span className={`text-right max-w-[58%] text-sm ${mono ? 'font-mono text-ias-green text-xs' : 'text-white font-medium'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toast.info('Digital pass download coming soon!')}
                className="btn-ghost w-full justify-center text-xs"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 2v7M4 7l2.5 2.5L9 7M2 11h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download Pass
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSignOut}
                className="w-full py-3 text-[11px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 hover:bg-red-500/8 rounded-2xl transition-all border border-transparent hover:border-red-500/10"
              >
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;