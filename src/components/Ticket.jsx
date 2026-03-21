import { QRCodeSVG } from 'qrcode.react';

const Ticket = ({ user, event }) => {
  // The data inside the QR code for the admin to scan
  const qrData = JSON.stringify({
    uid: user.id,
    eid: event.id,
    name: user.full_name
  });

  return (
    <div className="bg-white text-black p-8 rounded-3xl max-w-sm mx-auto shadow-2xl overflow-hidden">
      <div className="border-b-2 border-dashed border-gray-200 pb-6 mb-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Event Pass</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">IEEE IAS SBC JECC</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <QRCodeSVG value={qrData} size={180} level="H" />
        </div>
        
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Participant</p>
          <p className="text-xl font-black uppercase">{user.full_name || "ARON ALEX"}</p> [cite: 10]
          <p className="text-xs font-mono text-ias-green font-bold mt-1">ID: {user.membership_id || "101163901"}</p> [cite: 11]
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-[8px] text-gray-400 uppercase font-bold">Event</p>
          <p className="text-[10px] font-bold uppercase">{event.title}</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-gray-400 uppercase font-bold">Date</p>
          <p className="text-[10px] font-bold uppercase">{event.date}</p>
        </div>
      </div>
    </div>
  );
};

export default Ticket;