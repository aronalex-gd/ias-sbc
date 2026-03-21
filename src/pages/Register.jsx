import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Ticket from '../components/Ticket';

const Register = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get Event Details
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      setEvent(eventData);

      // 2. Get User Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);
      }
    };
    fetchData();
  }, [eventId]);

  const handleRegister = async () => {
    const { error } = await supabase.from('event_registrations').insert([
      {
        event_id: eventId,
        user_id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        membership_id: profile.membership_id
      }
    ]);

    if (error) alert(error.message);
    else setIsRegistered(true);
  };

  if (!event || !profile) return <div className="pt-40 text-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050505] pt-40 pb-20 px-6">
      {!isRegistered ? (
        <div className="max-w-2xl mx-auto bg-zinc-900/50 p-10 rounded-3xl border border-white/10 backdrop-blur-md">
          <h2 className="text-sm font-bold text-ias-green tracking-[0.3em] uppercase mb-2">Confirm Registration</h2>
          <h1 className="text-4xl font-black text-white uppercase mb-6">{event.title}</h1>
          
          <div className="space-y-4 mb-10">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500 uppercase text-[10px] font-bold">Name</span>
              <span className="text-white font-bold uppercase">{profile.full_name}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500 uppercase text-[10px] font-bold">Member ID</span>
              <span className="text-ias-green font-mono">{profile.membership_id || "N/A"}</span>
            </div>
          </div>

          <button 
            onClick={handleRegister}
            className="w-full bg-ias-green text-black font-black py-5 rounded-2xl hover:scale-[1.02] transition-transform uppercase tracking-widest"
          >
            Confirm & Generate Ticket
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white uppercase">Registration <span className="text-ias-green">Successful</span></h2>
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mt-2">Screenshot your ticket for entry</p>
          </div>
          <Ticket user={profile} event={event} />
        </div>
      )}
    </div>
  );
};

export default Register;