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
      className="flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-500 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <FcGoogle size={24} />
      <span className="font-semibold text-gray-700">Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
