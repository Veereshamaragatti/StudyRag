'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiImage, FiX } from 'react-icons/fi';
import MessageBubble from './MessageBubble';
import MicInput from './MicInput';
import { chatAPI } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  chatId?: string;
  initialMessages?: Message[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId: initialChatId, initialMessages = [] }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(initialChatId);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat history when chatId changes
  useEffect(() => {
    if (initialChatId) {
      loadChatHistory(initialChatId);
    }
  }, [initialChatId]);

  const loadChatHistory = async (id: string) => {
    try {
      const response = await chatAPI.getChat(id);
      if (response.chat && response.chat.messages) {
        setMessages(response.chat.messages);
      }
      setChatId(id);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      role: 'user',
      content: input || 'Image query',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.ask(input, chatId, selectedImage || undefined);
      
      setChatId(response.chatId);
      setFollowUpQuestions(response.followUpQuestions || []);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      clearImage();
    } catch (error: any) {
      console.error('Error asking question:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInput(question);
    setFollowUpQuestions([]);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl font-semibold mb-4 text-white">What are you working on?</h1>
            <p className="text-gray-400 mb-8">Upload documents and start asking questions</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}
        
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Follow-up Questions */}
        {followUpQuestions.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="font-semibold text-sm text-gray-300 mb-2">💡 Suggested Questions:</p>
            <div className="space-y-2">
              {followUpQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleFollowUpClick(question)}
                  className="block w-full text-left px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors text-sm text-gray-300"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-6 py-2 bg-gray-800 border-t border-gray-700">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 bg-gray-900 border-t border-gray-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-gray-800 rounded-2xl p-2">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {/* Image Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
              title="Upload image"
            >
              <FiImage size={20} />
            </button>

            {/* Text Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything"
              className="flex-1 px-4 py-3 bg-transparent text-white resize-none focus:outline-none placeholder-gray-500"
              rows={1}
              disabled={loading}
            />

            {/* Voice Input */}
            <MicInput onTranscript={handleVoiceTranscript} />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || loading}
              className="p-2 text-white rounded-lg disabled:text-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <FiSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
