import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import GlobalFamily from '../components/GlobalFamily';

const staggerList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] } },
};

const About = () => {
  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const timelineRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const cardsInView = useInView(cardsRef, { once: true, margin: '-80px' });
  const timelineInView = useInView(timelineRef, { once: true, margin: '-80px' });

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const pillars = [
    {
      title: 'Our Mission',
      text: 'Bridge the gap between academic theory and industrial practice through workshops, seminars, and real-world industry visits.',
      accent: 'border-ias-green',
      icon: '',
    },
    {
      title: 'Our Vision',
      text: 'Create a community of technically proficient engineers ready to solve real-world electrical and electronic challenges.',
      accent: 'border-white/20',
      icon: '',
    },
    {
      title: 'Our Values',
      text: 'Innovation, collaboration, integrity, and a relentless commitment to advancing technology for the benefit of humanity.',
      accent: 'border-zinc-600',
      icon: '',
    },
  ];

  const timeline = [
    { year: 'March 2022', event: 'Chapter Founded', desc: 'IEEE IAS SBC JECC officially inaugurated at Jyothi Engineering College.' },
    { year: 'April 2022', event: 'First Major Event', desc: '' },
    { year: 'March 2026', event: 'Growth Phase', desc: 'Membership crossed 50 active members' },
    { year: 'April 2026', event: 'Digital Platform', desc: 'Launched this member portal for seamless event registration and ID management.' },
    { year: '2026', event: 'Present Day', desc: 'Continuing to grow with more events, mentors, and industry connections.' },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white overflow-hidden">

      {/* Hero */}
      <section ref={heroRef} className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-0 w-64 h-64 bg-ias-green/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={heroInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-bold text-ias-green uppercase tracking-[0.35em] mb-4"
          >
            Who We Are
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-6xl md:text-8xl text-white mb-8 leading-none"
          >
            ABOUT <span className="text-ias-green">US</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="max-w-2xl"
          >
            <p className="text-zinc-300 text-lg md:text-xl leading-relaxed mb-4">
              The IEEE Industry Applications Society (IAS) Student Branch Chapter of Jyothi Engineering College 
              is a platform for students to connect with the global engineering industry.
            </p>
            <p className="text-zinc-500 text-base leading-relaxed">
              We organize technical workshops, industrial visits, and networking opportunities that prepare 
              the next generation of engineers for real-world challenges.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section ref={cardsRef} className="py-16 px-6 bg-black/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerList}
            initial="hidden"
            animate={cardsInView ? 'visible' : 'hidden'}
            className="grid md:grid-cols-3 gap-5"
          >
            {pillars.map((pillar, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`glass rounded-3xl p-8 border-l-2 ${pillar.accent} cursor-default`}
              >
                <span className="text-2xl mb-4 block">{pillar.icon}</span>
                <h3 className="font-bold text-white text-lg mb-3 tracking-tight">{pillar.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{pillar.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section ref={timelineRef} className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={timelineInView ? { opacity: 1 } : {}}
            className="text-center mb-16"
          >
            <h2 className="font-display text-5xl text-white">
              Our <span className="text-ias-green">Journey</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Scroll-linked Line Background */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
            
            {/* Scroll-linked Fill Line */}
            <motion.div 
              style={{ height: lineHeight }}
              className="absolute left-8 md:left-1/2 top-0 w-px bg-ias-green shadow-[0_0_15px_rgba(0,210,106,0.8)] -translate-x-1/2 origin-top" 
            />

            <div className="flex flex-col gap-12 md:gap-20">
              {timeline.map((item, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                    className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Content */}
                    <div className={`flex-1 w-full glass rounded-3xl p-8 hover:border-ias-green/30 transition-colors ${
                       isEven ? 'md:text-right' : 'md:text-left'
                    }`}>
                      <h4 className="font-display text-4xl text-white mb-2">{item.year}</h4>
                      <h5 className="font-bold text-ias-green text-lg mb-4">{item.event}</h5>
                      <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>

                    {/* Center Node */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8">
                      <motion.div 
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.4, delay: i * 0.1 + 0.3 }}
                        className="w-4 h-4 rounded-full bg-ias-green ring-4 ring-ias-green/20"
                      />
                    </div>

                    {/* Empty spacer for alternating layout */}
                    <div className="hidden md:block flex-1" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* IEEE Family strip */}
      <GlobalFamily />
    </div>
  );
};

export default About;
