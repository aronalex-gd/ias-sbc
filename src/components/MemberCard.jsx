/**
 * MemberCard.jsx — Strategy Pattern Card Rendering
 *
 * Three rendering strategies based on role:
 *   non_ieee_member  → Guest card (neutral palette, no ID fields)
 *   ieee_member      → Standard IEEE card
 *   ieee_ias_member  → IAS Premium card (gold-green accent, star badge)
 */

import React from 'react';
import { motion } from 'framer-motion';

// ─── Card Strategy: Guest (Non-IEEE) ─────────────────────────────────────────
const GuestCard = ({ name }) => (
  <div className="relative w-full max-w-[480px] aspect-[1.618/1] rounded-3xl overflow-hidden border border-white/8 shadow-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 group">
    {/* Subtle background shapes */}
    <div className="absolute top-0 right-0 w-40 h-40 bg-zinc-700/20 rounded-full blur-3xl -mr-12 -mt-12" />
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-zinc-800/30 rounded-full blur-2xl -ml-8 -mb-8" />
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/2 to-transparent" />

    {/* Diagonal stripe texture */}
    <div className="absolute inset-0 opacity-5"
      style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 12px)' }} />

    <div className="relative z-10 h-full p-5 xs:p-6 sm:p-8 flex flex-col justify-between">
      {/* Top */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-500 font-bold text-[8px] sm:text-[9px] tracking-[0.4em] uppercase mb-1.5">General Member</p>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-white/80 tracking-tighter uppercase leading-none truncate max-w-[220px] xs:max-w-[280px]">
            {name || 'MEMBER'}
          </h2>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[11px] sm:text-[13px] font-black italic text-white/10 tracking-tighter">IEEE</div>
          <div className="text-[7px] sm:text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Guest Access</div>
        </div>
      </div>

      {/* Guest badge */}
      <div className="flex items-center gap-2 my-auto py-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-700/50 bg-zinc-800/50">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="3.5" r="2" stroke="#71717A" strokeWidth="1.1"/>
            <path d="M1 9c0-2 1.8-3 4-3s4 1 4 3" stroke="#71717A" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span className="text-[8px] sm:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Non-IEEE Member</span>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-bold">Access Level</p>
          <p className="text-xs sm:text-sm font-black text-zinc-400 uppercase tracking-tight">Community</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-bold">IEEE IAS</p>
          <p className="text-xs sm:text-sm font-black text-zinc-500 uppercase tracking-tight">JECC Chapter</p>
        </div>
      </div>
    </div>

    {/* Hover shine */}
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
  </div>
);

// ─── Card Strategy: Standard IEEE ────────────────────────────────────────────
const IeeeCard = ({ name, memberId, subsection, membershipExpiry }) => {
  const expiryLabel = membershipExpiry
    ? new Date(membershipExpiry).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
    : '—';

  return (
    <div className="relative w-full max-w-[480px] aspect-[1.618/1] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-ias-green/10 rounded-full blur-[60px] -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10" />

      <div className="relative z-10 h-full p-5 xs:p-6 sm:p-8 flex flex-col justify-between">
        {/* Top */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-ias-green font-black text-[8px] sm:text-[9px] tracking-[0.4em] uppercase mb-1">Student Member</p>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none truncate max-w-[220px] xs:max-w-[280px]">
              {name || 'MEMBER'}
            </h2>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[12px] sm:text-[14px] font-black italic text-white/20 tracking-tighter">IEEE</div>
            <div className="text-[7px] sm:text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">2026 Edition</div>
          </div>
        </div>

        {/* Member ID */}
        <div className="my-auto py-2">
          <p className="text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-1 sm:mb-2">Member Number</p>
          <p className="text-xl xs:text-2xl sm:text-3xl font-mono font-black text-white tracking-widest truncate">
            {memberId || '—'}
          </p>
        </div>

        {/* Bottom */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Subsection</p>
            <p className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">{subsection || 'IEEE'}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] sm:text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Valid Through</p>
            <p className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">{expiryLabel}</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </div>
  );
};

// ─── Card Strategy: IAS Premium ───────────────────────────────────────────────
const IasCard = ({ name, memberId, subsection, membershipExpiry }) => {
  const expiryLabel = membershipExpiry
    ? new Date(membershipExpiry).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
    : '—';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[480px] aspect-[1.618/1] rounded-3xl overflow-hidden shadow-2xl group"
      style={{ background: 'linear-gradient(135deg, #0a1a10 0%, #0f2018 50%, #071209 100%)' }}
    >
      {/* Rich IAS glow layers */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-ias-green/20 rounded-full blur-[80px] -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-ias-green/10 rounded-full blur-3xl -ml-12 -mb-12" />
      <div className="absolute inset-0 border border-ias-green/20 rounded-3xl" />

      {/* Premium grid texture */}
      <div className="absolute inset-0 opacity-[0.04] rounded-3xl"
        style={{ backgroundImage: 'linear-gradient(rgba(0,210,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,106,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 h-full p-5 xs:p-6 sm:p-8 flex flex-col justify-between">
        {/* Top */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="#00D26A">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <p className="text-ias-green font-black text-[8px] sm:text-[9px] tracking-[0.4em] uppercase">IAS Member</p>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none truncate max-w-[220px] xs:max-w-[280px]">
              {name || 'MEMBER'}
            </h2>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] sm:text-[11px] font-black italic tracking-tight" style={{ color: 'rgba(0,210,106,0.4)' }}>IAS</div>
            <div className="text-[7px] sm:text-[8px] font-bold text-ias-green/40 uppercase tracking-widest mt-1">Verified</div>
          </div>
        </div>

        {/* Member ID */}
        <div className="my-auto py-2">
          <p className="text-[8px] sm:text-[9px] text-ias-green/50 uppercase tracking-[0.3em] font-bold mb-1 sm:mb-2">Member Number</p>
          <p className="text-xl xs:text-2xl sm:text-3xl font-mono font-black tracking-widest truncate" style={{ color: 'rgba(0,210,106,0.9)' }}>
            {memberId || '—'}
          </p>
        </div>

        {/* Bottom */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[8px] sm:text-[9px] text-ias-green/40 uppercase tracking-[0.2em] font-bold">Subsection</p>
            <p className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">{subsection || 'IEEE IAS'}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] sm:text-[9px] text-ias-green/40 uppercase tracking-[0.2em] font-bold">Valid Through</p>
            <p className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">{expiryLabel}</p>
          </div>
        </div>
      </div>

      {/* Premium shimmer */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(0,210,106,0.08) 50%, transparent 70%)' }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      />
    </motion.div>
  );
};

// ─── Main MemberCard (Strategy Dispatcher) ────────────────────────────────────
/**
 * Props:
 *   name             string
 *   memberId         string | null
 *   role             'non_ieee_member' | 'ieee_member' | 'ieee_ias_member' | 'admin'
 *   variant          'guest' | 'standard' | 'ias'
 *   subsection       string | null
 *   membershipExpiry string | null  (ISO date)
 *   expiryDate       string | null  (Formatted date label)
 */
const MemberCard = ({ name, memberId, role, variant, subsection, membershipExpiry, expiryDate }) => {
  const finalExpiry = membershipExpiry || expiryDate;
  const sharedProps = { name, memberId, subsection, membershipExpiry: finalExpiry };

  const activeRole = role || variant;

  if (activeRole === 'non_ieee_member' || activeRole === 'guest') {
    return <GuestCard name={name} />;
  }

  if (activeRole === 'ieee_ias_member' || activeRole === 'ias' || activeRole === 'ias-member') {
    return <IasCard {...sharedProps} />;
  }

  // Default: ieee_member, admin, standard
  return <IeeeCard {...sharedProps} />;
};

export default MemberCard;