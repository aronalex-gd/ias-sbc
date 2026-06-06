/**
 * Profile.jsx — Dynamic member dashboard
 *
 * Role logic (mirrors Auth.jsx meta.role values):
 *   'non_ieee_member'  → MemberCard in Guest state; no IAS controls
 *   'ieee_member'      → MemberCard in Standard IEEE state; "Request IAS Verification" CTA
 *   'ieee_ias_member'  → MemberCard in Special IAS Edition state (post-admin approval)
 *   'admin'            → IEEE card + admin badge; no verification button needed
 *
 * Real-time: Supabase subscription on profiles row — card upgrades instantly
 * when an admin sets ias_status = 'approved' and role = 'ieee_ias_member'.
 *
 * Supabase profile fields consumed (set by Auth.jsx):
 *   full_name, email, role, ias_status, membership_id, subsection, membership_expiry, is_guest
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MemberCard from '../components/MemberCard';
import { useToast } from '../components/Toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null;

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, mono = false, accent = false }) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0">
    <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{label}</span>
    <span
      className={`text-sm font-medium ${
        mono   ? 'font-mono text-[11px]' : ''
      } ${accent ? 'text-ias-green' : 'text-white'}`}
    >
      {value ?? '—'}
    </span>
  </div>
);

// ─── IAS Status Badge ─────────────────────────────────────────────────────────
const IasStatusBadge = ({ status }) => {
  const map = {
    approved: { label: 'IAS Verified',  cls: 'text-ias-green bg-ias-green/10 border-ias-green/20' },
    pending:  { label: 'IAS Pending',   cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
    rejected: { label: 'IAS Rejected',  cls: 'text-red-400 bg-red-400/10 border-red-400/20' },
    none:     { label: 'Not Verified',  cls: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' },
  };
  const { label, cls } = map[status] ?? map.none;
  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${cls}`}>
      {label}
    </span>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mb-3">{children}</p>
);

// ─── Sign-out Button ──────────────────────────────────────────────────────────
const SignOutButton = ({ onSignOut }) => (
  <motion.button
    onClick={onSignOut}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    className="w-full mt-4 text-[11px] font-bold text-zinc-600 hover:text-red-400 transition-colors py-3 border border-white/5 rounded-2xl hover:border-red-400/20"
  >
    Sign Out
  </motion.button>
);

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0C0C0E]">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-8 h-8 border-2 border-ias-green/20 border-t-ias-green rounded-full"
    />
  </div>
);

// ─── Main Profile Component ───────────────────────────────────────────────────
const Profile = () => {
  const navigate = useNavigate();
  const toast    = useToast();

  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [requesting, setRequesting] = useState(false);

  // ── Fetch current user profile ────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) { navigate('/auth'); return; }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, ias_status, membership_id, subsection, membership_expiry, is_guest')
      .eq('id', user.id)
      .single();

    if (error) { toast.error('Could not load profile.'); setLoading(false); return; }
    setProfile(data);
    setLoading(false);
  }, [navigate, toast]);

  // ── Real-time subscription: profile row changes (e.g. admin approval) ─────
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`profile:${profile.id}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'profiles',
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          // Merge incoming changes — card re-renders without a full fetch
          setProfile((prev) => ({ ...prev, ...payload.new }));

          if (payload.new.role === 'ieee_ias_member') {
            toast.success('🎉 IAS membership verified! Your card has been upgraded.');
          }
          if (payload.new.ias_status === 'rejected') {
            toast.error('IAS verification was not approved. Contact an admin for details.');
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  // ── Request IAS Verification ──────────────────────────────────────────────
  // Sets ias_status → 'pending'  (field name matches Auth.jsx meta.ias_status)
  const handleRequestIas = async () => {
    if (requesting) return;
    setRequesting(true);

    const { error } = await supabase
      .from('profiles')
      .update({ ias_status: 'pending' })
      .eq('id', profile.id);

    if (error) {
      toast.error('Request failed. Please try again.');
    } else {
      setProfile((prev) => ({ ...prev, ias_status: 'pending' }));
      toast.success('IAS verification request submitted! An admin will review it shortly.');
    }
    setRequesting(false);
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (!profile) return null;

  const {
    role, ias_status, full_name, email,
    membership_id, subsection, membership_expiry,
  } = profile;

  const isNonIeee   = role === 'non_ieee_member';
  const isIeee      = role === 'ieee_member';
  const isIas       = role === 'ieee_ias_member';
  const isAdmin     = role === 'admin';

  // IAS request button visibility:
  //   Show only for ieee_members whose ias_status is 'none' or 'rejected'
  const canRequestIas = isIeee && (ias_status === 'none' || ias_status === 'rejected');

  // ─── Derive MemberCard props from role ────────────────────────────────────
  // MemberCard variant is controlled purely by `variant` prop:
  //   'guest'    → non_ieee_member
  //   'standard' → ieee_member  (+ ieee_ias_member while still pending, edge-case)
  //   'ias'      → ieee_ias_member (Special IAS Edition)
  const cardVariant = isNonIeee ? 'guest' : isIas ? 'ias' : 'standard';

  return (
    <div className="min-h-screen bg-[#0C0C0E] pt-32 pb-20 px-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,210,106,0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-ias-green animate-pulse" />
            <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em]">
              Member Dashboard
            </p>
          </div>
          <h1 className="font-display text-5xl text-white leading-none">
            WELCOME,{' '}
            <span className="text-ias-green">
              {full_name?.split(' ')[0]?.toUpperCase() ?? 'MEMBER'}
            </span>
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* ── Left: Member Card ──────────────────────────────────────────── */}
          <div className="md:col-span-3">
            <SectionLabel>
              {isIas ? 'Special IAS Edition' : isNonIeee ? 'Guest Membership Card' : 'IEEE Membership Card'}
            </SectionLabel>

            <AnimatePresence mode="wait">
              <motion.div
                key={cardVariant}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{ opacity: 0, y: -16,   scale: 0.97 }}
                transition={{ duration: 0.35 }}
              >
                <MemberCard
                  variant={cardVariant}
                  name={full_name}
                  email={email}
                  memberId={membership_id}
                  subsection={subsection}
                  expiryDate={membership_expiry ? fmt(membership_expiry) : null}
                />
              </motion.div>
            </AnimatePresence>

            {/* IAS Request CTA — only for eligible ieee_members */}
            <AnimatePresence>
              {canRequestIas && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <motion.button
                    onClick={handleRequestIas}
                    disabled={requesting}
                    whileHover={{ scale: requesting ? 1 : 1.01 }}
                    whileTap={{ scale: requesting ? 1 : 0.98 }}
                    className="btn-primary w-full"
                    style={{ paddingTop: 16, paddingBottom: 16 }}
                  >
                    {requesting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                        />
                        Submitting…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1v6M4 4l3-3 3 3M2 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Request IAS Verification
                      </span>
                    )}
                  </motion.button>
                  <p className="text-[10px] text-zinc-600 text-center mt-2">
                    An admin will review your IEEE IAS membership and upgrade your card.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pending state notice */}
            <AnimatePresence>
              {ias_status === 'pending' && isIeee && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 glass rounded-2xl p-4 border border-yellow-400/15 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
                  <p className="text-xs text-yellow-400/80">
                    Your IAS verification request is under review. Your card will upgrade automatically once approved.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Profile Details ─────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-4">
            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>Account</SectionLabel>
                <IasStatusBadge status={ias_status ?? 'none'} />
              </div>
              <div className="space-y-3">
                <InfoRow label="Name"  value={full_name} />
                <InfoRow label="Email" value={email} />
                <InfoRow
                  label="Role"
                  value={
                    isAdmin    ? 'Administrator'   :
                    isIas      ? 'IAS Member'      :
                    isIeee     ? 'IEEE Member'     :
                                 'General Member'
                  }
                  accent={isIas}
                />
              </div>
            </motion.div>

            {/* IEEE Details — hidden for non-IEEE members */}
            {!isNonIeee && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-3xl p-6 border border-white/5"
              >
                <SectionLabel>IEEE Details</SectionLabel>
                <div className="space-y-3">
                  <InfoRow label="Member ID"  value={membership_id}              mono accent />
                  <InfoRow label="Subsection" value={subsection} />
                  <InfoRow
                    label="Expires"
                    value={membership_expiry ? fmt(membership_expiry) : null}
                  />
                </div>
              </motion.div>
            )}

            {/* Guest upgrade prompt for non-IEEE members */}
            {isNonIeee && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-3xl p-6 border border-white/5"
              >
                <SectionLabel>Upgrade Membership</SectionLabel>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  Are you an IEEE member? Create a new account with your IEEE card to unlock full access, including IAS verification and your digital membership card.
                </p>
                <a
                  href="/auth"
                  className="btn-primary text-[11px] py-2.5 px-4 flex items-center justify-center gap-2"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="3" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M1 5.5h10M4 3V2h4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Register as IEEE Member
                </a>
              </motion.div>
            )}

            {/* Admin shortcut */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  onClick={() => navigate('/admin')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full glass rounded-2xl p-4 border border-white/5 hover:border-ias-green/30 transition-all text-left flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-ias-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-ias-green/20 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ias-green">
                      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M1 12c0-2.76 2.24-4.5 6-4.5s6 1.74 6 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Admin Dashboard</p>
                    <p className="text-[10px] text-zinc-600">Manage members and events</p>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto text-zinc-700 group-hover:text-ias-green transition-colors">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </motion.div>
            )}

            <SignOutButton onSignOut={handleSignOut} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;