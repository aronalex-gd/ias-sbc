import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const Activities = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
      setEvents(data || []);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter">
            Upcoming <span className="text-ias-green">Events</span>
          </h1>
          <p className="text-zinc-500 mt-4 font-bold tracking-[0.3em] uppercase text-xs">
            Innovation & Excellence at JECC
          </p>
        </div>

        {/* The Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <div 
              key={event.id}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-md transition-all hover:border-ias-green/50 ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              {/* Event Image */}
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={event.image_url || 'https://via.placeholder.com/800x450'} 
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-ias-green font-mono text-xs font-bold tracking-widest uppercase">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                    {event.location}
                  </span>
                </div>
                
                <h3 className={`font-black text-white uppercase mb-4 ${index === 0 ? 'text-4xl' : 'text-xl'}`}>
                  {event.title}
                </h3>
                
                <p className="text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-2">
                  {event.description}
                </p>

                <Link 
                  to={`/register/${event.id}`}
                  className="inline-block w-full text-center py-4 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-ias-green transition-colors"
                >
                  Register Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;