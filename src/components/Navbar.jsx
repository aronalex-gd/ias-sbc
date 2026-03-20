import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Replace with your actual logo later */}
          <div className="w-8 h-8 bg-ias-green rounded-sm"></div>
          <span className="font-black text-xl tracking-tighter">
            IEEE <span className="text-ias-green">IAS</span> JECC
          </span>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest text-gray-300">
          <a href="#" className="hover:text-ias-green transition-colors">Home</a>
          <a href="#" className="hover:text-ias-green transition-colors">About</a>
          <a href="#" className="hover:text-ias-green transition-colors">Execom</a>
          <a href="#" className="hover:text-ias-green transition-colors text-ias-green">Events</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;