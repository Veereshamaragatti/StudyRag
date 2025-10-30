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
    <div className="flex flex-col h-full bg-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-4xl font-semibold mb-4 text-white">What are you working on?</h1>
            <p className="text-white/60 mb-8">Upload documents and start asking questions</p>
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
            <div className="bg-white/10 rounded-lg px-4 py-3 border border-white/20">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Follow-up Questions */}
        {followUpQuestions.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="font-semibold text-sm text-white/80 mb-2">💡 Suggested Questions:</p>
            <div className="space-y-2">
              {followUpQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleFollowUpClick(question)}
                  className="block w-full text-left px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-colors text-sm text-white"
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
        <div className="px-6 py-2 bg-black border-t border-white/10">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-white text-black rounded-full p-1 hover:bg-white/90"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 bg-black border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2">
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
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
              title="Upload image"
            >
              <FiImage size={20} />
            </button>

            {/* Text Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-3 bg-transparent text-white resize-none focus:outline-none placeholder-white/40"
              rows={1}
              disabled={loading}
            />

            {/* Voice Input */}
            <MicInput onTranscript={handleVoiceTranscript} />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || loading}
              className="p-2 bg-white text-black hover:bg-white/90 rounded-lg disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
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
