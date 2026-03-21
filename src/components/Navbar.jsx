import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Logos (Ensure these paths match your folder structure)
import iasLogo from '../assets/images/IEEE IAS Logo.png';
import ieeeLogo from '../assets/images/IEEE_logo.png'; 

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path) => location.pathname === path ? "text-ias-green" : "text-gray-300";

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo Group */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="flex items-center gap-2 border-r border-white/20 pr-4">
            <img src={iasLogo} alt="IAS" className="h-10 w-auto object-contain" />
            <img src={ieeeLogo} alt="IEEE" className="h-6 w-auto object-contain opacity-80" />
          </div>
          <div className="flex-col leading-tight hidden sm:flex">
            <span className="font-black text-lg tracking-tighter text-white">
              IAS <span className="text-ias-green">JECC</span>
            </span>
            <span className="text-[9px] tracking-[0.3em] text-gray-400 uppercase font-bold">SBC Chapter</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em]">
          <Link to="/" className={`${isActive('/')} hover:text-white transition-colors`}>Home</Link>
          <Link to="/about" className={`${isActive('/about')} hover:text-white transition-colors`}>About</Link>
          <Link to="/activities" className={`${isActive('/activities')} hover:text-white transition-colors`}>Activities</Link>
          
          {user ? (
            <Link to="/profile" className="bg-white/10 hover:bg-ias-green hover:text-black px-5 py-2 rounded-full transition-all border border-white/10">
              Profile
            </Link>
          ) : (
            <Link to="/auth" className="bg-ias-green text-black px-6 py-2 rounded-full hover:bg-white transition-all shadow-lg shadow-ias-green/20">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-8 flex flex-col gap-6 text-center font-bold tracking-widest text-xs">
          <Link to="/" onClick={() => setIsOpen(false)}>HOME</Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>ABOUT</Link>
          <Link to="/activities" onClick={() => setIsOpen(false)}>ACTIVITIES</Link>
          {user ? (
            <Link to="/profile" className="text-ias-green" onClick={() => setIsOpen(false)}>MY PROFILE</Link>
          ) : (
            <Link to="/auth" className="text-ias-green" onClick={() => setIsOpen(false)}>LOGIN / SIGNUP</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;