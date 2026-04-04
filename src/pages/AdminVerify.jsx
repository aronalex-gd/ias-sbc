import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { MousePointerClick, CheckCircle } from 'lucide-react';

const AdminVerify = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [previewUser, setPreviewUser] = useState(null);
  const toast = useToast();

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, membership_id, ias_status, subsection, membership_expiry, role')
      .eq('ias_status', 'pending')
      .order('updated_at', { ascending: true });
    if (!error) setPendingUsers(data || []);
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    setProcessing(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: 'ieee_ias_member',
        ias_status: 'approved' 
      })
      .eq('id', userId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('IAS membership verified!');
      setPreviewUser(null);
      fetchPending();
    }
    setProcessing(null);
  };

  const handleReject = async (userId) => {
    setProcessing(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ ias_status: 'rejected' })
      .eq('id', userId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.info('IAS request rejected. Member remains IEEE only.');
      setPreviewUser(null);
      fetchPending();
    }
    setProcessing(null);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em] mb-2">Admin Panel</p>
          <h1 className="font-display text-5xl text-white">
            IAS <span className="text-ias-green">Approvals</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            {pendingUsers.length} request{pendingUsers.length !== 1 ? 's' : ''} pending verification
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* ── List ────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
              </div>
            ) : pendingUsers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-3xl p-16 text-center flex flex-col items-center justify-center"
              >
                <div className="text-ias-green mb-4 opacity-80"><CheckCircle size={48} /></div>
                <h3 className="font-display text-3xl text-white mb-2">All Clear</h3>
                <p className="text-zinc-500 text-sm">No pending IAS approvals.</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {pendingUsers.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass rounded-2xl p-5 mb-3 border cursor-pointer transition-all ${
                      previewUser?.id === user.id
                        ? 'border-ias-green/30 bg-ias-green/4'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                    onClick={() => setPreviewUser(previewUser?.id === user.id ? null : user)}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center flex-shrink-0">
                        <span className="font-display text-lg text-white/50">{user.full_name?.[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{user.full_name}</p>
                        <p className="text-zinc-500 text-xs truncate">{user.email}</p>
                      </div>
                      <div className="font-mono text-ias-green text-[10px] flex-shrink-0">{user.membership_id}</div>
                    </div>

                    {/* Expiry info */}
                    {user.membership_expiry && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                          Valid through{' '}
                          {new Date(user.membership_expiry).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); handleApprove(user.id); }}
                        disabled={processing === user.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn-primary text-[10px] py-2 px-4 flex-1 justify-center"
                      >
                        {processing === user.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full"
                          />
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Approve IAS
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); handleReject(user.id); }}
                        disabled={processing === user.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="text-[10px] font-bold py-2 px-4 rounded-full border border-red-500/20 text-red-500/60 hover:text-red-500 hover:border-red-500/40 transition-colors"
                      >
                        Reject
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* ── Card Preview ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 lg:sticky lg:top-32">
            <AnimatePresence mode="wait">
              {previewUser ? (
                <motion.div
                  key={previewUser.id}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold mb-3">Card Preview</p>
                  <IasPendingCard
                    name={previewUser.full_name}
                    memberId={previewUser.membership_id}
                    subsection={previewUser.subsection}
                  />
                  <p className="text-[10px] text-zinc-700 text-center">
                    After approval, this card becomes:
                  </p>
                  <IasVerifiedCard
                    name={previewUser.full_name}
                    memberId={previewUser.membership_id}
                    subsection={previewUser.subsection}
                    expiryDate={
                      previewUser.membership_expiry
                        ? new Date(previewUser.membership_expiry)
                            .toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                            .toUpperCase()
                        : null
                    }
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass rounded-3xl p-10 text-center border border-white/5 flex flex-col items-center justify-center min-h-[300px]"
                >
                  <div className="text-zinc-500 mb-3 opacity-60"><MousePointerClick size={36} /></div>
                  <p className="text-zinc-600 text-sm">Click a member to preview their card</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerify;
