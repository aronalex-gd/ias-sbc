import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const icons = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#00D26A" strokeWidth="1.5"/>
      <path d="M5 8l2.5 2.5L11 5.5" stroke="#00D26A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#FF4D4D" strokeWidth="1.5"/>
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#FF4D4D" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#60A5FA" strokeWidth="1.5"/>
      <path d="M8 7v4M8 5.5v.01" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

const colorMap = {
  success: 'border-[#00D26A]/20 bg-[#00D26A]/5',
  error: 'border-red-500/20 bg-red-500/5',
  info: 'border-blue-400/20 bg-blue-400/5',
};

const Toast = ({ id, message, type, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border glass ${colorMap[type]} min-w-[280px] max-w-[380px] shadow-2xl`}
  >
    <span className="flex-shrink-0">{icons[type]}</span>
    <p className="text-sm font-medium text-white/90 flex-1">{message}</p>
    <button
      onClick={() => onRemove(id)}
      className="text-white/30 hover:text-white/60 transition-colors ml-2 flex-shrink-0"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
  </motion.div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <Toast key={t.id} {...t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
