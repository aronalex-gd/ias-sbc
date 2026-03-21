import React from 'react';

const MemberCard = ({ name, memberId, role }) => {
  return (
    <div className="relative w-full max-w-125 aspect-[1.618/1] rounded-3xl p-8 overflow-hidden border border-white/10 shadow-2xl bg-linear-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl group">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-ias-green/10 rounded-full blur-[60px] -mr-10 -mt-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
      
      {/* Top Section */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-ias-green font-black text-[10px] tracking-[0.4em] uppercase mb-1">
            {role === 'ias-member' ? 'Student Member' : 'Member'}
          </p>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
            {name || "ARON ALEX"}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-[14px] font-black italic text-white/20 tracking-tighter">IEEE</div>
          <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">2026 Edition</div>
        </div>
      </div>

      {/* Middle Section - ID */}
      <div className="mt-12 relative z-10">
        <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-2">Member Number</p>
        <p className="text-3xl font-mono font-black text-white tracking-widest bg-clip-text">
          {memberId || "101163901"}
        </p>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
        <div>
          <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Subsection</p>
          <p className="text-sm font-black text-white uppercase tracking-tight">Kochi Subsection</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Valid Through</p>
          <p className="text-sm font-black text-white uppercase tracking-tight">31 DEC 2026</p>
        </div>
      </div>

      {/* Glossy Overlay shine */}
      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    </div>
  );
};

export default MemberCard;