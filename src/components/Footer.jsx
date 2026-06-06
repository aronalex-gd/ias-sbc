import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaGlobe } from 'react-icons/fa';
import iasLogoImg from '../assets/logos/ias1.png';

const FooterLink = ({ href, to, children }) => {
  const cls = "text-zinc-500 hover:text-ias-green text-sm transition-colors duration-200 flex items-center gap-1.5 group";
  const arrow = (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200">
      <path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (to) return <Link to={to} className={cls}>{children}{arrow}</Link>;
  return <a href={href} className={cls}>{children}{arrow}</a>;
};

const Footer = () => (
  <footer className="relative bg-[#080809] border-t border-white/5 pt-20 pb-10 px-6 overflow-hidden">
    {/* Ambient glow */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-ias-green/5 rounded-full blur-[60px] pointer-events-none" />

    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        
        {/* Brand - wide col */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-4 mb-5">
            {/* Main Chapter Logo */}
            <img 
              src={iasLogoImg}
              alt="IEEE IAS JECC Logo" 
              className="h-10 w-auto object-contain"
            />
            
            {/* Optional: Divider and secondary info/logo */}
            <div className="h-8 w-[1px] bg-white/10 mx-1" />
            <div>
              <div className="text-white font-bold tracking-tight">IEEE IAS JECC</div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-[0.25em]">SB Chapter</div>
            </div>
          </div>
          <p className="text-zinc-600 text-xs leading-relaxed max-w-xs">
            Jyothi Engineering College, Vettikkattiri PO,<br />
            Cheruthuruthy, Kerala — 679531
          </p>
          <div className="flex gap-4 mt-6">
            {[
              { icon: <FaInstagram />, href: 'https://www.instagram.com/ieee_ias_sbc_jecc', target: "_blank" },
            ].map((social, i) => (
              <motion.a
                key={i}
                href={social.href}
                target='_blank'
                whileHover={{ scale: 1.1, color: '#00D26A' }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 glass rounded-xl flex items-center justify-center text-zinc-500 hover:text-ias-green hover:border-ias-green/20 transition-colors text-base"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div className="md:col-span-2 md:col-start-6">
          <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-5">Navigate</h4>
          <div className="flex flex-col gap-3">
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/activities">Events</FooterLink>
            <FooterLink to="/execom">Team</FooterLink>
          </div>
        </div>

        {/* Account */}
        <div className="md:col-span-2">
          <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-5">Account</h4>
          <div className="flex flex-col gap-3">
            <FooterLink to="/auth">Sign In</FooterLink>
            <FooterLink to="/auth">Register</FooterLink>
            <FooterLink to="/profile">My Profile</FooterLink>
          </div>
        </div>

        
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-[10px] text-zinc-700 uppercase tracking-[0.4em]">
          Advancing Technology for Humanity
        </p>
        <p className="text-[10px] text-zinc-700">
          © {new Date().getFullYear()} IEEE IAS SBC JECC — All Rights Reserved
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
