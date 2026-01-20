'use client';

import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const GoogleLoginButton: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/google`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg w-full shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98]"
    >
      <FcGoogle size={28} className="group-hover:scale-110 transition-transform" />
      <span className="font-semibold">Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
