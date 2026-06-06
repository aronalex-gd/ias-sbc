import React from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

const Ticket = ({ user, event }) => {
  const qrData = JSON.stringify({
    uid: user.id,
    eid: event.id,
    name: user.full_name,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="relative max-w-sm mx-auto"
    >
      {/* Glow */}
      <div className="absolute inset-0 bg-ias-green/10 rounded-4xl blur-2xl" />

      <div className="relative bg-white rounded-[28px] overflow-hidden shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="bg-surface px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-6 h-6 bg-ias-green rounded-md flex items-center justify-center">
              <span className="font-display text-black text-[10px]">IAS</span>
            </div>
            <span className="text-white font-bold text-xs tracking-widest uppercase">IEEE IAS SBC JECC</span>
          </div>
          <p className="text-zinc-600 text-[9px] uppercase tracking-[0.3em]">Event Pass · 2026</p>
        </div>

        {/* Perforated edge */}
        <div className="relative flex items-center">
          <div className="absolute -left-4 w-8 h-8 bg-white rounded-full border-r border-gray-100" />
          <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-8" />
          <div className="absolute -right-4 w-8 h-8 bg-white rounded-full border-l border-gray-100" />
        </div>

        {/* Body */}
        <div className="px-8 py-7 text-black">
          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 inline-block">
              <QRCodeSVG
                value={qrData}
                size={160}
                level="H"
                fgColor="#0C0C0E"
                bgColor="transparent"
              />
            </div>
          </div>

          {/* User info */}
          <div className="text-center mb-6">
            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-[0.2em] mb-1">Participant</p>
            <p className="text-xl font-black uppercase tracking-tight text-black">
              {user.full_name || 'Attendee'}
            </p>
            <p className="text-[11px] font-mono font-bold mt-1 text-ias-green-dim">
              ID: {user.membership_id || 'N/A'}
            </p>
          </div>

          {/* Event details */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
            <div>
              <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest mb-1">Event</p>
              <p className="text-[11px] font-black uppercase text-black leading-tight">{event.title}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest mb-1">Date</p>
              <p className="text-[11px] font-black uppercase text-black leading-tight">{event.date}</p>
            </div>
          </div>

          {/* Barcode-like decoration */}
          <div className="flex justify-center gap-px mt-6 opacity-10">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="bg-black"
                style={{
                  width: i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2,
                  height: 24,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Ticket;
