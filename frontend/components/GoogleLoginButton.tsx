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
      className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-105 font-medium text-lg w-full"
    >
      <FcGoogle size={28} />
      <span className="font-semibold">Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
