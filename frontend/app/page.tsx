'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiFolder, FiPlus, FiMessageSquare, FiMenu, FiX } from 'react-icons/fi';
import ChatWindow from '@/components/ChatWindow';
import { authAPI, chatAPI } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ChatHistoryItem {
  _id: string;
  title?: string;
  updatedAt: Date;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchChatHistory();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await authAPI.getCurrentUser();
      setUser(data);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await chatAPI.getHistory();
      const chats = Array.isArray(response) ? response : response.chats || [];
      setChatHistory(chats);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setChatHistory([]);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNewChat = () => {
    setSelectedChatId(undefined);
    window.location.href = '/';
  };

  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);
    window.location.href = `/?chatId=${chatId}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chatId');
    if (chatId) {
      setSelectedChatId(chatId);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto mb-4"></div>
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-black border-r border-white/10 flex flex-col overflow-hidden flex-shrink-0`}>
        {sidebarOpen && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/10">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 rounded-xl transition-all font-medium btn-shine"
              >
                <FiPlus size={18} />
                <span>New Chat</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-3">
              <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3 px-2">
                Recent Chats
              </h3>
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center mx-auto mb-3">
                    <FiMessageSquare className="text-white/20" size={24} />
                  </div>
                  <p className="text-white/30 text-sm">No conversations yet</p>
                  <p className="text-white/20 text-xs mt-1">Start a new chat above</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chatHistory.map((chat, index) => (
                    <button
                      key={chat._id}
                      onClick={() => handleSelectChat(chat._id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group flex items-center gap-3 ${
                        selectedChatId === chat._id 
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border-l-2 border-indigo-500' 
                          : 'hover:bg-white/5 border-l-2 border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedChatId === chat._id 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-500' 
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <FiMessageSquare size={14} className={selectedChatId === chat._id ? 'text-white' : 'text-white/40'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${
                          selectedChatId === chat._id ? 'text-white font-medium' : 'text-white/60 group-hover:text-white/80'
                        }`}>
                          {chat.title || 'New conversation'}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {new Date(chat.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/10 space-y-1">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-sm text-white/70 hover:text-white group"
              >
                <FiFolder size={18} className="group-hover:text-indigo-400 transition-colors" />
                <span>My Documents</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-all text-sm text-white/50 hover:text-red-400"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="p-4 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-xl transition-all"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-sm">📚</span>
              </div>
              <span className="text-xl font-bold gradient-text">StudyRag</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-white/60">{user?.name}</span>
          </div>
        </nav>

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden">
          <ChatWindow chatId={selectedChatId} />
        </main>
      </div>
    </div>
  );
}
