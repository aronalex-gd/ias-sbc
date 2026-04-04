import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RenewalBanner from './components/RenewalBanner';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Execom from './pages/Execom';
import Activities from './pages/Activities';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Register from './pages/Register';
import AdminVerify from './pages/AdminVerify';
import Admin from './pages/Admin';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                 element={<PageTransition><Home /></PageTransition>} />
        <Route path="/about"            element={<PageTransition><About /></PageTransition>} />
        <Route path="/execom"           element={<PageTransition><Execom /></PageTransition>} />
        <Route path="/activities"       element={<PageTransition><Activities /></PageTransition>} />
        <Route path="/auth"             element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/profile"          element={
          <ProtectedRoute>
            <PageTransition><Profile /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/events/:id"       element={
          <ProtectedRoute>
            <PageTransition><Register /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/about/ias"        element={<PageTransition><About /></PageTransition>} />
        <Route path="/membership/benefits" element={<PageTransition><About /></PageTransition>} />
        <Route path="/admin/verify"     element={
          <ProtectedRoute>
            <PageTransition><AdminVerify /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/admin"            element={
          <ProtectedRoute>
            <PageTransition><Admin /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="*"                 element={<PageTransition><Home /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function AppInner() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-surface text-white noise-bg">
          <ScrollToTop />
          <Navbar />
          <RenewalBanner />
          <main>
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
