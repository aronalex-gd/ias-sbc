import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ieeeLogoImg from '../assets/logos/ieeesbc1.png';
import iasLogoImg from '../assets/logos/ias1.png';
import ieeesbcLogoImg from '../assets/logos/ieee1.png';

/* ── Nav Link with animated underline ─────────────────────────────────────── */
const NavLink = ({ to, label, isActive, onClick }) => (
  <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 ${
        isActive ? 'text-ias-green' : 'text-zinc-400 hover:text-white'
      }`}
    >
      {label}
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-0 right-0 h-px bg-ias-green"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  </motion.div>
);

/* ── Image logos ──────────────────────────────────────────────────────── */
const IEEELogo = () => (
  <img
    src={ieeeLogoImg}
    alt="IEEE"
    width={90}
    height={60}
    style={{ objectFit: "contain" }}
  />
);

const IASLogo = () => (
  <img
    src={iasLogoImg}
    alt="IAS"
    width={40}
    height={40}
    style={{ objectFit: "contain" }}
  />
);

const JECCLogo = () => (
  <img
    src={ieeesbcLogoImg}
    alt="JECC SBC"
    width={80}
    height={40}
    style={{ objectFit: "contain" }}
  />
);

/* ── Profile Dropdown Component ────────────────────────────────────────────── */
const ProfileDropdown = ({ user, profile, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?';
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Member';

  return (
    <div ref={dropRef} className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2.5 pl-1 pr-3 py-1 glass rounded-full border border-white/8 hover:border-ias-green/30 transition-colors group"
      >
        <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-ias-green/40 to-ias-green/10 flex items-center justify-center border border-ias-green/30">
          <span className="font-display text-sm text-ias-green leading-none">{initial}</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-ias-green rounded-full border-2 border-[#0C0C0E]" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">
          {firstName}
        </span>
        <motion.svg 
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          className="text-zinc-600"
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl border border-white/8 shadow-2xl shadow-black/60 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs font-bold text-white truncate">{user?.user_metadata?.full_name || 'Member'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
            
            <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/4 transition-colors">
              My Profile
            </Link>
            
            {profile?.role === 'admin' && (
              <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-ias-green hover:text-white hover:bg-white/4 transition-colors">
                Admin Panel
              </Link>
            )}
            
            <div className="border-t border-white/5">
              <button 
                onClick={() => { setOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0C0C0E]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
        {/* Brand Logos */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center gap-1.5">
            <IEEELogo size={30} />
            <div className="w-px h-5 bg-white/10" />
            <IASLogo size={30} />
            <div className="w-px h-5 bg-white/10" />
            <JECCLogo size={30} />
          </div>
          <div className="hidden sm:block ml-6">
            <div className="text-white font-bold text-sm tracking-tight leading-none flex items-center gap-2">
              IEEE IAS <span className="text-ias-green">JECC</span>
              <span className="hidden lg:inline-flex bg-ias-green/10 text-ias-green border border-ias-green/20 px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest font-bold">Kerala Section</span>
              <span className="hidden lg:inline-flex bg-white/5 text-zinc-400 border border-white/10 px-2 py-0.5 rounded-full text-[8px] uppercase tracking-widest font-bold">Kochi Subsection</span>
            </div>
            <div className="text-[8px] text-zinc-500 uppercase tracking-[0.3em] font-bold mt-1">
              Industry Applications Society · SBC
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" label="Home" isActive={isActive('/')} />
          <NavLink to="/about/ias" label="About IAS" isActive={isActive('/about/ias')} />
          <NavLink to="/activities" label="Events" isActive={isActive('/activities')} />
          <NavLink to="/execom" label="Team" isActive={isActive('/execom')} />
        </div>

        {/* Auth Buttons / Profile Icon */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <ProfileDropdown user={user} profile={profile} onSignOut={signOut} />
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white glass rounded-full border border-white/8 transition-all">
                Sign In
              </Link>
              <Link to="/auth" className="btn-primary text-[11px] py-2.5 px-6">
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle (Simple placeholder) */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-[#0F0F12] border-b border-white/5 overflow-hidden"
          >
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } }
              }}
              className="px-6 py-8 space-y-6"
            >
              {[
                { to: "/", label: "Home" },
                { to: "/about/ias", label: "About IAS" },
                { to: "/activities", label: "Events" },
                { to: "/execom", label: "Team" }
              ].map((link) => (
                <motion.div
                  key={link.to}
                  variants={{
                    open: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
                    closed: { opacity: 0, x: -16, transition: { duration: 0.15 } }
                  }}
                >
                  <Link 
                    to={link.to} 
                    onClick={() => setIsOpen(false)} 
                    className={`block text-sm font-bold uppercase tracking-widest transition-colors ${
                      isActive(link.to) ? 'text-ias-green' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.hr 
                variants={{
                  open: { opacity: 0.1, scaleX: 1 },
                  closed: { opacity: 0, scaleX: 0 }
                }}
                className="border-white/5" 
              />
              
              {user ? (
                <motion.div
                  variants={{
                    open: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
                    closed: { opacity: 0, x: -16, transition: { duration: 0.15 } }
                  }}
                  className="space-y-6"
                >
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-ias-green">Profile</Link>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-ias-green">Admin Panel</Link>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  variants={{
                    open: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
                    closed: { opacity: 0, x: -16, transition: { duration: 0.15 } }
                  }}
                >
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="block text-sm font-bold uppercase tracking-widest text-white">Sign In</Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;