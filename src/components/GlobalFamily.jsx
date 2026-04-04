import React from 'react';
import { motion } from 'framer-motion';

// Import logos from assets
import logo1 from '../assets/logos/ies.webp';
import logo2 from '../assets/logos/pels.webp';
import logo3 from '../assets/logos/pes.webp';
import logo4 from '../assets/logos/sc.webp';
import logo5 from '../assets/logos/wie.png';
import logo6 from '../assets/logos/sight.webp';

const GlobalFamily = () => {
  // Use the 6 available logos (repeating the first two to match 8)
  const logos = [logo1, logo2, logo3, logo4, logo5, logo6, logo1, logo2];

  return (
    <section className="py-16 border-t border-white/5 bg-black/40 overflow-hidden relative">
      <div className="max-w-5xl mx-auto px-6 text-center mb-8">
        <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-bold">Part of the IEEE Global Family</p>
      </div>

      <div className="relative flex overflow-x-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ ease: 'linear', duration: 30, repeat: Infinity }}
          className="flex flex-none items-center gap-16 md:gap-24 opacity-40 px-12"
        >
          {/* Double the list for seamless infinite scrolling */}
          {[...logos, ...logos].map((logoSrc, i) => (
            <div key={i} className="flex items-center justify-center min-w-max">
                <img 
                  src={logoSrc} 
                  alt="Chapter Logo" 
                  className="h-16 w-auto grayscale hover:grayscale-0 transition-all duration-300 object-contain"
                />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GlobalFamily;
