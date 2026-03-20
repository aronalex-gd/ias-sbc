import React from 'react';

const MemberCard = ({ name, role, image }) => {
  return (
    <div className="bg-[#161616] border border-white/10 p-6 rounded-xl hover:border-[#00B050] transition-all group">
      <div className="w-32 h-32 bg-gray-800 rounded-full mx-auto mb-4 overflow-hidden border-2 border-[#00B050]">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-xl font-bold text-center text-white">{name}</h3>
      <p className="text-[#00B050] text-center text-sm font-semibold uppercase tracking-widest">{role}</p>
    </div>
  );
};

export default MemberCard; // THIS LINE IS CRUCIAL