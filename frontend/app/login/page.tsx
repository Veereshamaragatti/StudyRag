'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-3xl shadow-2xl p-10 max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="text-6xl">🎓</div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            StudyRAG
          </h1>
          <p className="text-gray-400 text-lg">
            Your AI-powered academic assistant
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4 text-lg">What you can do:</h2>
            <ul className="text-gray-300 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">✓</span>
                <span>Upload and manage documents</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">✓</span>
                <span>Ask questions with AI</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">✓</span>
                <span>Multimodal support (text, image, voice)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">✓</span>
                <span>Private and secure</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center">
            <GoogleLoginButton />
          </div>

          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
