import React from 'react';
import { Link } from 'react-router-dom';
import { UPCOMING_EVENTS, FAQS } from '../data';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      
      {/* 1. HERO SECTION */}
      <section className="pt-44 pb-24 px-6 relative flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-20 w-72 h-72 bg-ias-green/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <h4 className="text-ias-green font-bold tracking-[0.4em] uppercase text-[10px] mb-4">Jyothi Engineering College</h4>
        <h1 className="text-5xl md:text-8xl font-black leading-tight mb-6 tracking-tighter">
          WELCOME TO <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-ias-green to-emerald-400">
            IEEE IAS SBC JECC
          </span>
        </h1>
        <p className="max-w-2xl text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
          Bridging the gap between academic theory and industrial excellence. 
          Join a global community of innovators at JECC.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/activities" className="bg-ias-green text-black font-extrabold px-10 py-4 rounded-full hover:scale-105 transition-all shadow-lg shadow-ias-green/20">
            Upcoming Events
          </Link>
          <a href="#contact" className="border border-white/10 hover:border-ias-green/50 px-10 py-4 rounded-full transition-all backdrop-blur-sm">
            Contact Us
          </a>
        </div>
      </section>

      {/* 2. OUR IEEE FAMILY (Logos) */}
      <section className="py-10 border-y border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] tracking-[0.3em] uppercase text-gray-600 mb-8 font-bold">Our IEEE Family</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-xl font-bold italic tracking-tighter">IEEE KERALA SECTION</span>
            <span className="text-xl font-bold tracking-tighter">IAS GLOBAL</span>
            <span className="text-xl font-bold tracking-tighter">JECC CHERUTHURUTHY</span>
            <span className="text-xl font-bold tracking-tighter">IEEE LINK</span>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US & STATS */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter">About <span className="text-ias-green">Us</span></h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            The Industry Applications Society (IAS) Student Branch Chapter at Jyothi Engineering College 
            is dedicated to providing students with practical exposure to the electrical and electronics industry. 
            We organize technical workshops, industrial visits, and expert talks to prepare the next generation of engineers.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-[#111] rounded-2xl border border-white/5">
              <h3 className="text-3xl font-black text-ias-green">50+</h3>
              <p className="text-gray-500 uppercase text-[10px] tracking-widest mt-1">Active Members</p>
            </div>
            <div className="p-6 bg-[#111] rounded-2xl border border-white/5">
              <h3 className="text-3xl font-black text-white">12+</h3>
              <p className="text-gray-500 uppercase text-[10px] tracking-widest mt-1">Awards Won</p>
            </div>
          </div>
        </div>
        <div className="grid gap-6">
          <div className="p-8 bg-linear-to-br from-[#111] to-black rounded-3xl border-l-4 border-ias-green">
            <span className="text-ias-green font-bold uppercase text-xs tracking-widest">Vision</span>
            <p className="text-gray-300 mt-4 italic leading-relaxed">
              "IEEE Industry Applications Society will be a world leader in the advancement of science and technology, 
              linking theory and practice in the application of electrical and electronic systems for the benefit of humanity."
            </p>
          </div>
          <div className="p-8 bg-linear-to-br from-[#111] to-black rounded-3xl border-l-4 border-white">
            <span className="text-white font-bold uppercase text-xs tracking-widest">Mission</span>
            <p className="text-gray-300 mt-4 leading-relaxed text-sm">
              IEEE Industry Applications Society enables the advancement of theory and practice in the design, development, 
              manufacturing and application of safe, sustainable, reliable, smart electrical systems, equipment and services.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WHY JOIN IAS */}
      <section className="py-24 px-6 bg-[#050505] border-y border-white/5">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black mb-4 uppercase">Why <span className="text-ias-green">Join</span> IAS?</h2>
          <div className="h-1 w-20 bg-ias-green mx-auto"></div>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { t: "Global Network", d: "Connect with world-class engineers and researchers." },
            { t: "Resource Access", d: "Free access to journals, IEEE Xplore, and magazines." },
            { t: "Leadership", d: "Opportunities to lead teams and manage large-scale events." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-[#0F0F0F] border border-white/5 hover:border-ias-green/40 transition-all group">
              <div className="w-10 h-10 rounded-full bg-ias-green/10 flex items-center justify-center text-ias-green font-bold mb-6 group-hover:bg-ias-green group-hover:text-black transition-all">0{i+1}</div>
              <h4 className="text-xl font-bold mb-3">{item.t}</h4>
              <p className="text-gray-500 text-sm">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CONTACT & FAQ SECTION */}
      <section id="contact" className="py-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
        <div>
          <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter">Get In <span className="text-ias-green">Touch</span></h2>
          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Name" className="bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-ias-green w-full" />
              <input type="email" placeholder="Email" className="bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-ias-green w-full" />
            </div>
            <textarea placeholder="Your Message" rows="5" className="bg-[#111] border border-white/10 p-4 rounded-xl outline-none focus:border-ias-green w-full"></textarea>
            <button className="bg-white text-black font-black w-full py-4 rounded-xl hover:bg-ias-green transition-all tracking-widest uppercase text-sm">Send Message</button>
          </form>
        </div>

        <div>
          <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter">FA<span className="text-ias-green">Q</span></h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#111] p-6 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white mb-2">Q: {faq.q}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;