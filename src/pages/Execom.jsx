import React from 'react';
import MemberCard from '../components/MemberCard';
import { EXECOM } from '../data';

const Execom = () => (
  <div className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-5xl font-black uppercase">Our <span className="text-ias-green">Execom</span></h2>
      <p className="text-gray-500 mt-4 tracking-widest">THE MINDS BEHIND IAS SBC JECC</p>
    </div>

    {/* Leadership / Advisor Row */}
    <div className="flex justify-center mb-12">
      <MemberCard {...EXECOM[0]} />
    </div>

    {/* Grid for the rest */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {EXECOM.slice(1).map(member => (
        <MemberCard key={member.id} {...member} />
      ))}
    </div>
  </div>
);

export default Execom;