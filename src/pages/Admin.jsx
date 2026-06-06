import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';

import { CheckCircle, MousePointerClick, Calendar as CalendarIcon, User, UserCheck, PackageOpen } from 'lucide-react';

/* ── Protected Route Wrapper ─────────────────────────────────────────────── */
const useAdminGuard = () => {
  const [status, setStatus] = useState('loading'); // loading | allowed | denied
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus('denied'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setStatus('allowed');
      } else {
        setStatus('denied');
      }
    };
    check();
  }, []);

  return status;
};

/* ── Stat Card ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, color = 'ias-green' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden glass rounded-2xl p-5 border border-white/5 bg-gradient-to-br from-white/5 to-transparent shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none`} />
    <div className="flex items-center justify-between mb-3 relative z-10">
      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{label}</span>
      <div className={`w-8 h-8 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} text-sm`}>
        {icon}
      </div>
    </div>
    <div className="font-display text-4xl text-white relative z-10">{value}</div>
  </motion.div>
);

/* ── IAS Approvals Tab ───────────────────────────────────────────────────── */
const ApprovalsTab = ({ refreshStats }) => {
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
      if (refreshStats) refreshStats();
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
      if (refreshStats) refreshStats();
    }
    setProcessing(null);
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6 items-start">
      {/* List */}
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-lg text-white/50">{user.full_name?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{user.full_name}</p>
                    <p className="text-zinc-500 text-xs truncate">{user.email}</p>
                  </div>
                  <div className="font-mono text-ias-green text-[10px] flex-shrink-0">{user.membership_id}</div>
                </div>

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

                <div className="flex gap-2">
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); handleApprove(user.id); }}
                    disabled={processing === user.id}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="btn-primary text-[10px] py-2 px-4 flex-1 justify-center"
                  >
                    {processing === user.id ? (
                      <motion.div animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full" />
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
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
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

      {/* Card Preview */}
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
              <p className="text-[10px] text-zinc-700 text-center">After approval, this card becomes:</p>
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
  );
};

/* ── Event Management Tab ────────────────────────────────────────────────── */
const EventsTab = ({ refreshStats }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image_url: '',
    registration_link: '',
  });
  const toast = useToast();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('date', { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      toast.error('Title and date are required.');
      return;
    }
    setCreating(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      date: form.date,
      location: form.location || null,
      image_url: form.image_url || null,
      registration_link: form.registration_link || null,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from('events').update(payload).eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('events').insert([payload]);
      error = insertError;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Event ${editingId ? 'updated' : 'created'} successfully!`);
      resetForm();
      fetchEvents();
      if (refreshStats) refreshStats();
    }
    setCreating(false);
  };

  const handleEditClick = (ev) => {
    setForm({
      title: ev.title,
      description: ev.description || '',
      date: ev.date,
      location: ev.location || '',
      image_url: ev.image_url || '',
      registration_link: ev.registration_link || '',
    });
    setEditingId(ev.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ title: '', description: '', date: '', location: '', image_url: '', registration_link: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.info('Event deleted.');
      fetchEvents();
      if (refreshStats) refreshStats();
    }
  };

  const inputCls = "input-field";
  const labelCls = "block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2";

  return (
    <div className="space-y-6">
      {/* Create button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-zinc-500">{events.length} event{events.length !== 1 ? 's' : ''} in database</p>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="btn-primary text-[11px] py-2.5 px-5"
        >
          {showForm ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              New Event
            </>
          )}
        </motion.button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-3xl p-6 md:p-8 border border-ias-green/15">
              <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.3em] mb-6">
                {editingId ? 'Edit Event' : 'Create New Event'}
              </p>

              <div onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Event Title *</label>
                    <input className={inputCls} placeholder="e.g. Industrial Automation Workshop"
                      value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Date *</label>
                    <input type="date" className={inputCls}
                      value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls} rows={3} placeholder="Brief description of the event..."
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ resize: 'none' }} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Location</label>
                    <input className={inputCls} placeholder="e.g. JECC Seminar Hall"
                      value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Image URL</label>
                    <input className={inputCls} placeholder="https://..."
                      value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Registration Link</label>
                  <input className={inputCls} placeholder="https://forms.gle/..."
                    value={form.registration_link} onChange={e => setForm({ ...form, registration_link: e.target.value })} />
                </div>
                <motion.button
                  onClick={handleCreateOrUpdate}
                  disabled={creating}
                  whileHover={{ scale: creating ? 1 : 1.01 }}
                  whileTap={{ scale: creating ? 1 : 0.98 }}
                  className="btn-primary w-full"
                  style={{ paddingTop: 16, paddingBottom: 16 }}
                >
                  {creating ? (
                    <span className="flex items-center gap-2">
                      <motion.div animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" />
                      Saving…
                    </span>
                  ) : (editingId ? 'Update Event' : 'Create Event')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-white/5 flex flex-col items-center justify-center">
          <div className="text-zinc-500 mb-3 opacity-60"><CalendarIcon size={36} /></div>
          <p className="text-zinc-500 text-sm">No events yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4"
            >
              {ev.image_url && (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                  <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{ev.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-mono text-ias-green">
                    {new Date(ev.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  {ev.location && (
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{ev.location}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <motion.button
                  onClick={() => handleEditClick(ev)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-ias-green/70 hover:text-ias-green hover:bg-ias-green/10 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(ev.id)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 3h9M5 3V2h3v1M4 3v8h5V3H4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── All Members Tab ─────────────────────────────────────────────────────── */
const MembersTab = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, membership_id, role, ias_status, membership_expiry')
        .order('full_name');
      setMembers(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = members.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.membership_id?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (role, iasStatus) => {
    if (role === 'admin') return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    if (role === 'ieee_ias_member') return 'text-ias-green bg-ias-green/10 border-ias-green/20';
    if (iasStatus === 'pending') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
  };

  const roleLabel = (role, iasStatus) => {
    if (role === 'admin') return 'Admin';
    if (role === 'ieee_ias_member') return 'IAS Member';
    if (iasStatus === 'pending') return 'IAS Pending';
    return 'IEEE Member';
  };

  return (
    <div className="space-y-4">
      <input
        className="input-field"
        placeholder="Search by name, email, or member ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-14 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-4"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <span className="font-display text-base text-white/40">{m.full_name?.[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{m.full_name}</p>
                <p className="text-zinc-600 text-xs truncate">{m.email}</p>
              </div>
              <span className="font-mono text-zinc-600 text-[10px] hidden sm:block">{m.membership_id || '—'}</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${roleColor(m.role, m.ias_status)}`}>
                {roleLabel(m.role, m.ias_status)}
              </span>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-zinc-600 py-12 flex flex-col items-center">
               <PackageOpen size={32} className="mb-3 opacity-30" />
               <p className="text-sm">No members found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main Admin Dashboard ────────────────────────────────────────────────── */
const Admin = () => {
  const adminStatus = useAdminGuard();
  const [tab, setTab] = useState('approvals');
  const [stats, setStats] = useState({ pending: 0, ieee: 0, ias: 0, events: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (adminStatus === 'denied') {
      navigate('/');
    }
  }, [adminStatus, navigate]);

  const fetchStats = async () => {
    if (adminStatus !== 'allowed') return;
    const [{ count: pending }, { count: ieee }, { count: ias }, { count: events }] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('ias_status', 'pending'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'ieee_member'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'ieee_ias_member'),
      supabase.from('events').select('id', { count: 'exact', head: true }),
    ]);
    setStats({ pending: pending || 0, ieee: ieee || 0, ias: ias || 0, events: events || 0 });
  };

  useEffect(() => {
    fetchStats();
  }, [adminStatus]);

  if (adminStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0C0E]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-ias-green/20 border-t-ias-green rounded-full" />
      </div>
    );
  }

  if (adminStatus === 'denied') return null;

  const tabs = [
    { id: 'approvals', label: 'IAS Approvals', badge: stats.pending > 0 ? stats.pending : null },
    { id: 'events', label: 'Events' },
    { id: 'members', label: 'Members' },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0E] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-ias-green animate-pulse" />
            <p className="text-[10px] text-ias-green font-bold uppercase tracking-[0.35em]">Admin Panel</p>
          </div>
          <h1 className="font-display text-5xl text-white">
            ADMIN <span className="text-ias-green">DASHBOARD</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Manage memberships, events, and verifications</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Pending " value={stats.pending}
            icon={<UserCheck size={18} strokeWidth={2.5} />} />
          <StatCard label="IEEE Members" value={stats.ieee} color="zinc-400"
            icon={<User size={18} strokeWidth={2.5} />} />
          <StatCard label="IAS Members" value={stats.ias} color="ias-green"
            icon={<CheckCircle size={18} strokeWidth={2.5} />} />
          <StatCard label="Total Events" value={stats.events} color="zinc-400"
            icon={<CalendarIcon size={18} strokeWidth={2.5} />} />
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 p-1 glass rounded-2xl border border-white/5 mb-8 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                tab === t.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
              {t.badge && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-ias-green rounded-full text-black text-[9px] font-black flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'approvals' && <ApprovalsTab refreshStats={fetchStats} />}
            {tab === 'events' && <EventsTab refreshStats={fetchStats} />}
            {tab === 'members' && <MembersTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;