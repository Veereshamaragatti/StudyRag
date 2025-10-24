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
      // Handle both array and object responses
      const chats = Array.isArray(response) ? response : response.chats || [];
      setChatHistory(chats);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setChatHistory([]); // Set empty array on error
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
    // Clear URL params and reload
    window.location.href = '/';
  };

  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);
    // Reload the page with the chat ID
    window.location.href = `/?chatId=${chatId}`;
  };

  // Get chatId from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chatId');
    if (chatId) {
      setSelectedChatId(chatId);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-950 border-r border-gray-800 flex flex-col overflow-hidden flex-shrink-0`}>
        {sidebarOpen && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FiPlus size={18} />
                <span className="font-medium">New chat</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-2">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-sm text-center mt-4">No chat history yet</p>
              ) : (
                <div className="space-y-1">
                  {chatHistory.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => handleSelectChat(chat._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                        selectedChatId === chat._id ? 'bg-gray-800' : ''
                      }`}
                    >
                      <FiMessageSquare size={16} className="flex-shrink-0" />
                      <span className="text-sm truncate">
                        {chat.title || 'New conversation'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-800 space-y-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors text-sm"
              >
                <FiFolder size={16} />
                <span>My Documents</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors text-sm text-red-400"
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
        {/* Top Bar */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <h1 className="text-xl font-semibold">StudyRAG</h1>
        </div>

        {/* Chat Area */}
        <main className="flex-1 overflow-hidden">
          <ChatWindow chatId={selectedChatId} />
        </main>
      </div>
    </div>
  );
}
