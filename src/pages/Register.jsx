import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Ticket from '../components/Ticket';
import { useToast } from '../components/Toast';

const Register = () => {
  const { id: eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: eventData }, { data: { user } }] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.auth.getUser(),
      ]);
      setEvent(eventData);

      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);

        // Check if already registered
        const { data: existing } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single();
        if (existing) setIsRegistered(true);
      }
      setLoading(false);
    };
    fetchData();
  }, [eventId]);

  const handleRegister = async () => {
    // Redirect to external Google Form
    const fallbackLink = "https://forms.gle/your-link-here";
    const googleFormUrl = event?.registration_link || fallbackLink;
    window.open(googleFormUrl, "_blank");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0C0E]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-ias-green/20 border-t-ias-green rounded-full"
      />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0C0E] text-center px-6">
      <div className="glass rounded-3xl p-12">
        <span className="text-4xl block mb-4">🔍</span>
        <h2 className="font-display text-3xl text-white mb-2">Event Not Found</h2>
        <p className="text-zinc-500 text-sm">This event may have been removed or the link is invalid.</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0C0E] text-center px-6">
      <div className="glass rounded-3xl p-12 max-w-sm">
        <span className="text-4xl block mb-4">🔒</span>
        <h2 className="font-display text-3xl text-white mb-2">Sign In Required</h2>
        <p className="text-zinc-500 text-sm mb-6">You need to be signed in to register for events.</p>
        <a href="/auth" className="btn-primary">Sign In</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0C0C0E] pt-32 pb-20 px-6">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,210,106,0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Event Preview */}
              {event.image_url && (
                <div className="w-full aspect-video rounded-3xl overflow-hidden mb-6 border border-white/5">
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="glass rounded-3xl p-8 md:p-10 border border-white/5">
                <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-2">Confirm Registration</p>
                <h1 className="font-display text-4xl md:text-5xl text-white mb-8 leading-tight">{event.title}</h1>

                <div className="space-y-3 mb-8">
                  {[
                    { label: 'Participant', value: profile.full_name },
                    { label: 'Email', value: profile.email },
                    { label: 'Member ID', value: profile.membership_id || 'N/A', mono: true },
                    {
                      label: 'Date',
                      value: new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    },
                    event.location && { label: 'Location', value: event.location },
                  ].filter(Boolean).map(({ label, value, mono }, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0">
                      <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{label}</span>
                      <span className={`text-sm text-white font-medium ${mono ? 'font-mono text-ias-green text-xs' : ''}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={handleRegister}
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
              </div>
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;
