'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎓 StudyRAG
          </h1>
          <p className="text-gray-600">
            Your AI-powered academic assistant
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-2">Features:</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Upload and manage documents</li>
              <li>✅ Ask questions with AI</li>
              <li>✅ Multimodal support (text, image, voice)</li>
              <li>✅ Private and secure</li>
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
