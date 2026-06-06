import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import MemberCard from '../components/MemberCard';
import { EXECOM } from '../data';

const staggerList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }
  },
};

const ExecomCard = ({ name, role, image }) => {
  // Magnetic hover state for the card contents
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.1;
    const y = (clientY - top - height / 2) * 0.1;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      variants={fadeUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className="glass rounded-3xl overflow-hidden border border-white/10 transition-colors duration-500 hover:border-ias-green/30 hover:shadow-[0_20px_40px_rgba(0,210,106,0.1)] cursor-default group"
    >
      {/* Photo with smooth grayscale → color transition */}
      <div className="relative aspect-square overflow-hidden bg-zinc-900/50">
        {image ? (
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-all duration-700 filter grayscale-[80%] brightness-90 group-hover:grayscale-0 group-hover:brightness-110"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        ) : (
          /* Placeholder avatar with initials */
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 relative overflow-hidden">
            <motion.img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'S')}&background=0D0D12&color=00D26A&size=200&bold=true`}
              alt={name || "Placeholder"}
              className="w-full h-full object-cover opacity-60 transition-all duration-700 filter grayscale-[80%] brightness-90 group-hover:grayscale-0 group-hover:brightness-110"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
            <div className="absolute inset-0 bg-ias-green/0 group-hover:bg-ias-green/10 transition-colors duration-700 pointer-events-none" />
          </div>
        )}

        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E] via-transparent to-transparent opacity-80" />

        {/* Role badge floated on photo */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="glass px-3 py-1 rounded-xl backdrop-blur-md border border-white/5 group-hover:border-ias-green/20 transition-colors duration-500">
            <p className="text-[8px] sm:text-[9px] font-bold text-ias-green uppercase tracking-[0.12em] sm:tracking-[0.25em] text-center whitespace-normal break-words flex items-center justify-center min-h-[1.5rem] md:min-h-0">{role}</p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="px-5 py-5 text-center">
        <p className="font-medium text-white text-[15px] tracking-[0.03em] group-hover:text-ias-green transition-colors duration-500">
          {name}
        </p>
      </div>
    </motion.div>
  );
};

const Execom = () => {
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' });

  return (
    <div className="min-h-screen bg-[#0C0C0E] pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-center mb-20"
        >
          <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-4">The People</p>
          <h1 className="font-display text-6xl md:text-8xl text-white leading-none">
            OUR <span className="text-ias-green">EXECOM</span>
          </h1>
          <p className="text-zinc-500 mt-4 text-sm uppercase tracking-[0.3em] font-bold">
            The Minds Behind IAS SBC JECC
          </p>
        </motion.div>

        {/* Team grid with staggered grayscale-to-color cards */}
        <motion.div
          ref={gridRef}
          variants={staggerList}
          initial="hidden"
          animate={gridInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 min-[385px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5"
        >
          {EXECOM.map((member) => (
            <ExecomCard key={member.id} {...member} />
          ))}
        </motion.div>

        {/* Hover instruction hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={gridInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-[10px] text-zinc-700 uppercase tracking-[0.3em] font-bold mt-8"
        >
          Hover over cards to reveal color
        </motion.p>

        {/* Card preview section */}
        {EXECOM.length > 0 && (
          <div className="mt-20">
            <motion.p
              initial={{ opacity: 0 }}
              animate={gridInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
              className="text-center text-[10px] text-zinc-600 uppercase tracking-[0.35em] font-bold mb-10"
            >
              Member Card Preview
            </motion.p>
            <div className="flex justify-center">
              <MemberCard name="IEEE Member" memberId="101167901" role="ias-member" iasStatus="verified" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Execom;
