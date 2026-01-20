'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="bg-black/50 backdrop-blur-sm border-b border-white/10 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <span className="text-xl font-bold text-white">ChatWithDocs</span>
          </div>
        </div>
      </nav>

      {/* Main Content - Two Partition Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Login Section */}
        <div className="w-1/2 flex items-center justify-center bg-black px-20 relative">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5"></div>
          
          <div className="max-w-md w-full relative z-10 fade-in">
            <div className="text-center mb-12">
              <div className="inline-block mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <span className="text-5xl">🎓</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome Back
              </h1>
              <p className="text-white/50 text-base">
                Sign in to continue your learning journey
              </p>
            </div>

            <div className="space-y-6">
              <GoogleLoginButton />

              <div className="text-center">
                <p className="text-white/30 text-xs">
                  By continuing, you agree to our{' '}
                  <span className="text-white/60 hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-white/60 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Project Info Section */}
        <div className="w-1/2 flex items-center justify-center bg-white/5 border-l border-white/10 text-white px-20">
          <div className="max-w-xl w-full fade-in">
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <span className="text-white">ChatWithDocs</span>
              </h2>
              <p className="text-lg text-white/60 mb-3">
                Your AI-Powered Document Assistant
              </p>
              <p className="text-sm text-white/40 leading-relaxed">
                Upload, manage, and chat with your documents — powered by RAG for accurate, context-aware answers.
              </p>
            </div>

            <div className="space-y-4" id="features">
              <div className="glass rounded-xl p-4 hover-lift transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="text-lg">📄</span>
                  </div>
                  <h3 className="font-semibold text-white">Smart Document Analysis</h3>
                </div>
                <p className="text-white/50 text-sm pl-13">Supports PDFs, DOCX, TXT, and more</p>
              </div>

              <div className="glass rounded-xl p-4 hover-lift transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                  <h3 className="font-semibold text-white">AI Chat</h3>
                </div>
                <p className="text-white/50 text-sm pl-13">Ask questions and get precise, real-time responses</p>
              </div>

              <div className="glass rounded-xl p-4 hover-lift transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                  <h3 className="font-semibold text-white">Multimodal Support</h3>
                </div>
                <p className="text-white/50 text-sm pl-13">Use text, voice, or images</p>
              </div>

              <div className="glass rounded-xl p-4 hover-lift transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="text-lg">🔒</span>
                  </div>
                  <h3 className="font-semibold text-white">Secure & Private</h3>
                </div>
                <p className="text-white/50 text-sm pl-13">Your data stays yours</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-white/40 text-center">
                ✨ Turn your files into knowledge — fast and effortless
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
