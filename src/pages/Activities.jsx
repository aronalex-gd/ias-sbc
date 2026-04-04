import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { EventCardSkeleton } from '../components/Skeleton';

const EventCard = ({ event, index, inView }) => {
  const isFeatured = index === 0;
  const dateStr = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const yearStr = new Date(event.date).getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.09, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={{ borderColor: 'rgba(0,210,106,0.3)' }}
      className={`group relative rounded-3xl border border-white/5 bg-zinc-900/40 overflow-hidden transition-colors duration-300 ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''
        }`}
    >
      {/* Image */}
      <div className={`overflow-hidden ${isFeatured ? 'aspect-[16/9]' : 'aspect-video'}`}>
        <motion.img
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.6 }}
          src={event.image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-ias-green rounded-full" />
            <span className="font-mono text-ias-green text-xs font-bold uppercase tracking-widest">
              {dateStr} · {yearStr}
            </span>
          </div>
          {event.location && (
            <span className="glass px-3 py-1 rounded-full text-[9px] text-zinc-500 uppercase font-bold tracking-widest">
              {event.location}
            </span>
          )}
        </div>

        <h3 className={`font-display text-white uppercase mb-3 leading-tight ${isFeatured ? 'text-4xl md:text-5xl' : 'text-xl md:text-2xl'}`}>
          {event.title}
        </h3>

        {event.description && (
          <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">
            {event.description}
          </p>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-2 w-full justify-center py-3.5 bg-white text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-ias-green transition-colors duration-200"
          >
            Register Now
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="col-span-3 flex flex-col items-center justify-center py-32 text-center"
  >
    <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center text-ias-green mb-6">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 3v6M22 3v6M4 14h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 21h8M16 18v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
    <h3 className="font-display text-3xl text-white mb-2">No Events Yet</h3>
    <p className="text-zinc-500 text-sm max-w-xs">
      Stay tuned! Exciting events are being planned. Check back soon or follow us on social media.
    </p>
  </motion.div>
);

const Activities = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef(null);
  const inView = useInView(gridRef, { once: true, margin: '-60px' });

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0C0E] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-4"
          >
            What's Happening
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-6xl md:text-8xl text-white leading-none"
          >
            UPCOMING<br />
            <span className="text-ias-green">EVENTS</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-zinc-500 text-sm mt-4 font-bold uppercase tracking-[0.2em]"
          >
            Innovation & Excellence at JECC
          </motion.p>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            <>
              <EventCardSkeleton featured />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </>
          ) : events.length === 0 ? (
            <EmptyState />
          ) : (
            events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} inView={inView} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
