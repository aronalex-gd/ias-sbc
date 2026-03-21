import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { scanMemberCard } from '../lib/ocr'; // We'll create this next

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isIas, setIsIas] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [memberId, setMemberId] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, role: isIas ? 'ias-member' : 'non-ias-member', membership_id: memberId } }
      });
      if (error) alert(error.message);
      else alert("Check email for verification!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const detectedId = await scanMemberCard(file);
      if (detectedId) setMemberId(detectedId);
      else alert("Could not detect ID. Please enter manually.");
    }
  };

  return (
    <div className="pt-40 pb-20 px-6 max-w-md mx-auto">
      <div className="bg-[#111] p-8 rounded-3xl border border-white/10 backdrop-blur-md">
        <h2 className="text-3xl font-black mb-6 text-center">
          {isSignUp ? 'JOIN' : 'WELCOME'} <span className="text-ias-green uppercase">Back</span>
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <input type="text" placeholder="Full Name" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none" onChange={(e) => setFullName(e.target.value)} />
          )}
          <input type="email" placeholder="Email" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none" onChange={(e) => setPassword(e.target.value)} />

          {isSignUp && (
            <div className="flex gap-2 p-1 bg-black rounded-xl border border-white/5">
              <button type="button" onClick={() => setIsIas(false)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${!isIas ? 'bg-white text-black' : 'text-gray-500'}`}>NON-IAS</button>
              <button type="button" onClick={() => setIsIas(true)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${isIas ? 'bg-ias-green text-black' : 'text-gray-500'}`}>IAS MEMBER</button>
            </div>
          )}

          {isSignUp && isIas && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest pl-2">Upload Membership Card</label>
              <input type="file" onChange={handleFileUpload} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-ias-green file:text-black" />
              <input type="text" placeholder="Member ID" value={memberId} readOnly className="w-full bg-black/50 border border-ias-green/20 p-4 rounded-xl text-ias-green font-mono" />
            </div>
          )}

          <button className="w-full bg-ias-green text-black font-black py-4 rounded-xl hover:scale-[1.02] transition-all">
            {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-ias-green ml-1 font-bold underline">
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;