import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import MemberCard from '../components/MemberCard';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black text-ias-green font-mono tracking-widest uppercase animate-pulse">
      Verifying Identity...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 flex flex-col items-center justify-center">
      {/* Background radial gradient for depth */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black pointer-events-none"></div>

      <div className="relative z-10 text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-4">
          Member <span className="text-ias-green">ID</span>
        </h1>
        <p className="text-zinc-500 text-xs font-bold tracking-[0.5em] uppercase">Verified Student Personnel</p>
      </div>

      <MemberCard 
        name={profile?.full_name} 
        memberId={profile?.membership_id} 
        role={profile?.role} 
      />

      <div className="mt-16 flex flex-col items-center gap-6 relative z-10">
        <button className="text-[10px] font-black text-zinc-500 hover:text-white tracking-[0.3em] uppercase transition-all duration-300 border-b border-zinc-800 pb-1">
          Download Digital Pass
        </button>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="px-8 py-3 bg-white/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-full text-[10px] font-black tracking-widest transition-all border border-white/5"
        >
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
};

export default Profile;