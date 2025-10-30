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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
                className="w-full flex items-center gap-3 px-4 py-3 bg-white text-black hover:bg-white/90 rounded-lg transition-colors font-medium"
              >
                <FiPlus size={18} />
                <span>New Chat</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-lg font-semibold text-white/80 mb-4">
                Chats
              </h3>
              {chatHistory.length === 0 ? (
                <p className="text-white/30 text-sm text-center mt-8">
                  No conversations yet
                </p>
              ) : (
                <div className="space-y-1">
                  {chatHistory.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => handleSelectChat(chat._id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors ${
                        selectedChatId === chat._id ? 'bg-white/10' : ''
                      }`}
                    >
                      <p className="text-sm text-white truncate">
                        {chat.title || 'New conversation'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-white/80"
              >
                <FiFolder size={16} />
                <span>My Documents</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-white/60 hover:text-white"
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="p-4 border-b border-white/10 flex items-center justify-between bg-black">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold">ChatWithDocs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
