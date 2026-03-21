import React from 'react';
import { FaInstagram, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa'; // npm install react-icons

const Footer = () => (
  <footer className="bg-black border-t border-white/5 pt-20 pb-10 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
      
      {/* Brand */}
      <div>
        <h3 className="text-2xl font-black mb-4 text-white">IEEE <span className="text-ias-green">IAS</span> JECC</h3>
        <p className="text-gray-500 text-sm">Jyothi Engineering College, Vettikkattiri PO, Cheruthuruthy, Kerala 679531</p>
      </div>

      {/* Quick Links */}
      <div className="flex flex-col gap-2 text-gray-400 text-sm">
        <h4 className="text-white font-bold mb-2 uppercase tracking-tighter">Navigate</h4>
        <a href="/" className="hover:text-ias-green">Home</a>
        <a href="/about" className="hover:text-ias-green">About</a>
        <a href="/activities" className="hover:text-ias-green">Events</a>
      </div>

      {/* Socials */}
      <div>
        <h4 className="text-white font-bold mb-4 uppercase tracking-tighter">Follow Our Family</h4>
        <div className="flex gap-6 text-2xl text-gray-400">
          <a href="#" className="hover:text-ias-green transition-colors"><FaInstagram /></a>
          <a href="#" className="hover:text-ias-green transition-colors"><FaLinkedin /></a>
          <a href="#" className="hover:text-ias-green transition-colors"><FaGlobe /></a>
        </div>
      </div>
    </div>

    <div className="text-center border-t border-white/5 pt-8">
      <p className="text-[10px] text-gray-600 tracking-[0.5em] uppercase italic">Advancing Technology for Humanity</p>
    </div>
  </footer>
);

export default Footer;