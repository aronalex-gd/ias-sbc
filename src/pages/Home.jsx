import React, { useRef, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, stagger, animate } from 'framer-motion';
import { FAQS } from '../data/index';

// 3D import removed

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] }
  }),
};

const staggerList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const Counter = ({ target, suffix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, target, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => { el.textContent = Math.round(v) + suffix; }
    });
    return () => controls.stop();
  }, [inView, target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
};

const BentoCard = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={`glass rounded-3xl border border-white/5 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

const FAQItem = ({ q, a, i }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div variants={fadeUp} custom={i} className="border-b border-white/5 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left gap-4">
        <span className="font-medium text-white text-sm">{q}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          className="shrink-0 w-7 h-7 glass rounded-full flex items-center justify-center text-ias-green">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.div>
      </button>
      <motion.div initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden">
        <p className="text-zinc-500 text-sm pb-5 leading-relaxed">{a}</p>
      </motion.div>
    </motion.div>
  );
};

// ── Letter-by-letter animation for headline ──
const AnimatedWord = ({ word, delay = 0, className = '' }) => {
  const letters = word.split('');
  return (
    <span className={`inline-block ${className}`}>
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 60, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.04,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

const Home = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });

  const whyRef = useRef(null);
  const whyInView = useInView(whyRef, { once: true, margin: '-80px' });

  const faqRef = useRef(null);
  const faqInView = useInView(faqRef, { once: true });

  const perks = [
    {
      num: '01',
      title: 'Global Network',
      desc: 'Connect with world-class engineers, researchers, and industry leaders across 160+ countries.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 10h16M10 2c-2 3-3 5-3 8s1 5 3 8M10 2c2 3 3 5 3 8s-1 5-3 8" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Resource Access',
      desc: 'Free access to IEEE Xplore, technical journals, webinars, and research papers.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 16v2h10V6l-4-4H7" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M6 7h4M6 10h6M6 13h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Leadership',
      desc: 'Lead teams, organize technical events, and build management skills that last a lifetime.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3l1.8 3.6 4 .6-2.9 2.8.7 4L10 12l-3.6 1.9.7-4L4.2 7.2l4-.6L10 3z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-white overflow-hidden">

      {/* ── 1. HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        {/* Animated glow orb */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-175 h-175 bg-ias-green/6 rounded-full blur-[130px] pointer-events-none"
        />

        {/* Content layout: text left, 3D right */}
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Typography */}
          <div className="text-left z-10">
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8"
            >
              <span className="w-1.5 h-1.5 bg-ias-green rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                Jyothi Engineering College
              </span>
            </motion.div>

            {/* Animated headline */}
            <h1 className="font-display text-7xl md:text-[9rem] lg:text-[10rem] leading-[0.88] tracking-wide mb-6"
              style={{ perspective: '800px' }}>
              <AnimatedWord word="IEEE" delay={0.1} className="block text-white" />
              <AnimatedWord word="IAS" delay={0.3} className="block text-gradient" />
              <AnimatedWord word="SBC" delay={0.5} className="block text-white" />
            </h1>

            {/* Subtext with serif elegance */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="max-w-md text-zinc-400 text-base md:text-lg leading-relaxed mb-10 font-light"
              style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
            >
              Bridging academic theory and industrial excellence —
              a community of innovators at JECC.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex flex-wrap gap-3"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/activities" className="btn-primary">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  Upcoming Events
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/about" className="btn-ghost">Learn More</Link>
              </motion.div>
            </motion.div>

            {/* Scroll cue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex items-center gap-3 mt-12"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-px h-8 bg-linear-to-b from-zinc-600 to-transparent"
              />
              <span className="text-[9px] text-zinc-600 uppercase tracking-[0.3em]">Scroll to explore</span>
            </motion.div>
          </div>

          {/* Right: Floating Particles & Glow Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="hidden md:flex items-center justify-center relative z-10 min-h-[400px] w-full"
          >
            {/* Live element background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3] 
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-[80%] h-[80%] bg-ias-green/20 blur-[120px] rounded-full"
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.1, 0.3, 0.1],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-[60%] h-[60%] bg-white/10 blur-[100px] rounded-full"
              />
            </div>

            {/* Glowing Text Badge */}
            <div className="relative text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-48 h-48 rounded-full border border-ias-green/30 bg-ias-green/5 backdrop-blur-sm flex items-center justify-center shadow-[0_0_80px_rgba(0,210,106,0.2)] mx-auto"
              >
                <span className="font-display text-5xl text-ias-green/80">IAS</span>
              </motion.div>
            </div>

            {/* Floating labels around the live element */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute top-12 right-12 glass px-3 py-2 rounded-2xl text-[10px] text-ias-green font-bold uppercase tracking-widest backdrop-blur-md"
            >
              IEEE
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute bottom-12 left-12 glass px-3 py-2 rounded-2xl text-[10px] text-zinc-400 font-bold uppercase tracking-widest backdrop-blur-md"
            >
              JECC
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. STATS BELT ── */}
      <section ref={statsRef} className="py-14 border-y border-white/5 bg-black/40">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            variants={staggerList}
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { val: 50, suffix: '+', label: 'Active Members' },
              { val: 30, suffix: '+', label: 'Events Hosted' },
              { val: 160, suffix: '+', label: 'IEEE Countries' },
              { val: 3, suffix: '', label: 'Years Active' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <div className="font-display text-5xl md:text-6xl text-white leading-none mb-1">
                  {statsInView ? <Counter target={s.val} suffix={s.suffix} /> : `0${s.suffix}`}
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 3. WHY JOIN ── */}
      <section className="py-28 px-6" ref={whyRef}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={whyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-4">Membership Benefits</p>
            <h2 className="font-display text-5xl md:text-7xl text-white">
              Why Join <span className="text-ias-green">IAS?</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerList}
            initial="hidden"
            animate={whyInView ? 'visible' : 'hidden'}
            className="grid md:grid-cols-3 gap-6"
          >
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, borderColor: 'rgba(0,210,106,0.25)' }}
                className="glass rounded-3xl p-8 border border-white/5 group cursor-default transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-ias-green/10 flex items-center justify-center text-ias-green group-hover:bg-ias-green group-hover:text-black transition-all duration-300">
                    {perk.icon}
                  </div>
                  <span className="font-display text-4xl text-white/5 group-hover:text-white/10 transition-colors">{perk.num}</span>
                </div>
                <h4 className="font-bold text-lg text-white mb-2 tracking-tight">{perk.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* New CTAs for Joining */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={whyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            <motion.a 
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              href="https://www.ieee.org/membership/join/" target="_blank" rel="noreferrer"
              className="btn-primary"
            >
              Join IEEE
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              href="https://ias.ieee.org/join-ias/" target="_blank" rel="noreferrer"
              className="btn-ghost !border-ias-green !text-ias-green hover:!bg-ias-green/10"
            >
              Join IEEE IAS
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ── 4. BENTO CTA SECTION ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-5">
          <BentoCard className="md:col-span-3 p-10 relative overflow-hidden bg-[#0e1a14]" delay={0}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-ias-green/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-4">Ready to Start?</p>
              <h3 className="font-display text-5xl text-white mb-5 leading-tight">Join the<br />IAS Community</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-xs">
                Register with your IEEE membership and gain access to exclusive events, resources, and a global network.
              </p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link to="/auth" className="btn-primary">
                  Create Account
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </motion.div>
            </div>
          </BentoCard>

          <div className="md:col-span-2 flex flex-col gap-5">
            <BentoCard className="p-8 flex-1 group transition-all duration-300 hover:border-white/20" delay={0.1}>
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L11 7h5L12 10l1.5 5L9 13l-4.5 2L6 10 2 7h5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
                {/* PLACEHOLDER: Insert image tag below for Industrial Visit preview image */}
                {/*<img src="/assets/images/iv-placeholder.jpg" alt="IV" className="w-16 h-16 rounded-xl object-cover opacity-80" /> */}
              </div>
              <h4 className="font-bold text-white text-xl mb-2">Industrial Experience</h4>
              <p className="text-zinc-500 text-sm leading-relaxed text-balance">Access exclusive real-world exposure at top manufacturing and tech companies across Kerala.</p>
            </BentoCard>

            <BentoCard className="p-8 flex-1 group transition-all duration-300 hover:border-ias-green/30" delay={0.2}>
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 rounded-2xl bg-ias-green/10 flex items-center justify-center text-ias-green group-hover:bg-ias-green group-hover:text-black transition-colors">
                  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                {/* PLACEHOLDER: Insert image tag below for Mentorship preview image */}
                {/* <img src="/assets/images/mentor-placeholder.jpg" alt="Mentor" className="w-16 h-16 rounded-xl object-cover opacity-80" /> */}
              </div>
              <h4 className="font-bold text-white text-xl mb-2">Pro Mentorship</h4>
              <p className="text-zinc-500 text-sm leading-relaxed text-balance">Get paired with active industry professionals who guide your technical and career growth.</p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ ── */}
      <section ref={faqRef} className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={faqInView ? { opacity: 1 } : {}}
            className="text-center mb-12"
          >
            <h2 className="font-display text-5xl text-white mb-3">
              Got <span className="text-ias-green">Questions?</span>
            </h2>
            <p className="text-zinc-500 text-sm">Everything you need to know about IEEE IAS SBC JECC.</p>
          </motion.div>

          <motion.div
            variants={staggerList}
            initial="hidden"
            animate={faqInView ? 'visible' : 'hidden'}
            className="glass rounded-3xl p-6 md:p-8"
          >
            {FAQS.map((faq, i) => <FAQItem key={i} {...faq} i={i} />)}
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
