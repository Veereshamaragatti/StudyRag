'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="bg-black border-b border-white/10 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-white">ChatWithDocs</span>
          </div>
        </div>
      </nav>

      {/* Main Content - Two Partition Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Login Section */}
        <div className="w-1/2 flex items-center justify-center bg-black px-20">
          <div className="max-w-md w-full">
            <div className="text-center mb-16">
              <div className="inline-block mb-8">
                <div className="text-6xl">🎓</div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-6">
                Welcome Back
              </h1>
              <p className="text-white/40 text-base">
                Sign in to continue your learning journey
              </p>
            </div>

            <div className="space-y-8">
              <GoogleLoginButton />

              <div className="text-center">
                <p className="text-white/30 text-xs">
                  By continuing, you agree to our <span className="text-white/40">Terms of Service</span> and <span className="text-white/40">Privacy Policy</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Project Info Section */}
        <div className="w-1/2 flex items-center justify-center bg-black border-l border-white/10 text-white px-20">
          <div className="max-w-xl w-full">
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">💬</span>
                <span>ChatWithDocs</span>
              </h2>
              <p className="text-lg text-white/50 mb-4">
                Your AI-Powered Document Assistant
              </p>
              <p className="text-sm text-white/40 leading-relaxed mb-3">
                Upload, manage, and chat with your documents — instantly.
              </p>
              <p className="text-xs text-white/30 leading-relaxed">
                Powered by Retrieval-Augmented Generation (RAG) for accurate, context-aware answers.
              </p>
            </div>

            <div className="space-y-6" id="features">
              <div className="border-l-4 border-white pl-6 py-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">📄</span>
                  <h3 className="font-bold text-base">Smart Document Analysis</h3>
                </div>
                <p className="text-white/40 text-xs">Supports PDFs, DOCX, TXT, and more</p>
              </div>

              <div className="border-l-4 border-white pl-6 py-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">🤖</span>
                  <h3 className="font-bold text-base">AI Chat</h3>
                </div>
                <p className="text-white/40 text-xs">Ask questions and get precise, real-time responses</p>
              </div>

              <div className="border-l-4 border-white pl-6 py-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">🎯</span>
                  <h3 className="font-bold text-base">Multimodal Support</h3>
                </div>
                <p className="text-white/40 text-xs">Use text, voice, or images</p>
              </div>

              <div className="border-l-4 border-white pl-6 py-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">🔒</span>
                  <h3 className="font-bold text-base">Secure & Private</h3>
                </div>
                <p className="text-white/40 text-xs">Your data stays yours</p>
              </div>

              <div className="border-l-4 border-white pl-6 py-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">☁️</span>
                  <h3 className="font-bold text-base">Deploy Anywhere</h3>
                </div>
                <p className="text-white/40 text-xs">SaaS, local, or Docker-ready</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 italic text-center">
                ChatWithDocs turns your files into knowledge — fast, intelligent, and effortless.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
