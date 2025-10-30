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
      className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all duration-300 font-semibold text-lg w-full shadow-lg"
    >
      <FcGoogle size={28} />
      <span className="font-semibold">Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
