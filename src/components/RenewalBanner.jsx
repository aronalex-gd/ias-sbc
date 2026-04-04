import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

/**
 * RenewalBanner
 * Shown globally (in App.jsx above <main>) whenever a logged-in user's
 * membership_expiry is within 30 days OR already past.
 */
const RenewalBanner = () => {
  const [banner, setBanner] = useState(null); // null | { type, daysLeft }
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('membership_expiry')
        .eq('id', user.id)
        .single();

      if (!profile?.membership_expiry) return;

      const expiry = new Date(profile.membership_expiry);
      const now = new Date();
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        setBanner({ type: 'expired', daysLeft });
      } else if (daysLeft <= 30) {
        setBanner({ type: 'warning', daysLeft });
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setBanner(null);
      setDismissed(false);
      check();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!banner || dismissed) return null;

  const isExpired = banner.type === 'expired';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative z-40 overflow-hidden ${
          isExpired
            ? 'bg-red-950/80 border-b border-red-500/20'
            : 'bg-yellow-950/60 border-b border-yellow-500/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
              isExpired ? 'bg-red-500/15' : 'bg-yellow-500/15'
            }`}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                className={isExpired ? 'text-red-400' : 'text-yellow-400'}>
                <path d="M7 1.5L1 12h12L7 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M7 5.5v3M7 10v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>

            <p className={`text-xs font-medium ${isExpired ? 'text-red-300' : 'text-yellow-300'}`}>
              {isExpired ? (
                <>Your IEEE Membership has expired. Please renew at <a href="https://ieee.org/start" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:no-underline text-red-200">ieee.org/start</a></>
              ) : (
                <>Your IEEE membership expires in{' '}
                  <strong>{banner.daysLeft} day{banner.daysLeft !== 1 ? 's' : ''}</strong>.
                  Renew to keep uninterrupted access.{' '}
                  <a href="https://ieee.org/renew" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:no-underline text-yellow-200">
                    Renew now →
                  </a>
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className={`flex-shrink-0 transition-colors p-1 rounded ${
              isExpired
                ? 'text-red-500/50 hover:text-red-400'
                : 'text-yellow-500/50 hover:text-yellow-400'
            }`}
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RenewalBanner;
