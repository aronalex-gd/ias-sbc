import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Component Imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page Imports
import Home from './pages/Home';
import About from './pages/About';
import Execom from './pages/Execom';
import Activities from './pages/Activities';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Register from './pages/Register';

// A small helper component to reset scroll position on page change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-ias-green selection:text-black">
        {/* Helper to reset scroll */}
        <ScrollToTop />
        
        {/* Navigation - Stays visible on all pages */}
        <Navbar />

        {/* Page Content - Swaps based on the URL */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/execom" element={<Execom />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />     
            <Route path="/register/:eventId" element={<Register />} />
            {/* Optional: 404 Redirect to Home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Simple Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;