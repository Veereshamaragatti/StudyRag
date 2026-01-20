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

  const handleVoiceTranscript = (transcript: string, autoSend: boolean = false) => {
    console.log('📝 Received transcript:', transcript);
    setInput(transcript);
    
    // Auto-send if requested (when user stops speaking)
    if (autoSend && transcript.trim()) {
      setTimeout(() => {
        handleSend();
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6">
              <span className="text-4xl">📚</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 gradient-text">What are you working on?</h1>
            <p className="text-white/50 mb-8 max-w-md">Upload your documents and start asking questions. I'll help you find answers instantly.</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <span className="px-4 py-2 glass rounded-full text-sm text-white/60">📄 PDF</span>
              <span className="px-4 py-2 glass rounded-full text-sm text-white/60">📝 DOCX</span>
              <span className="px-4 py-2 glass rounded-full text-sm text-white/60">📜 TXT</span>
            </div>
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
          <div className="glass rounded-xl p-4 fade-in">
            <p className="font-medium text-sm text-white/70 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs">💡</span>
              Suggested Questions
            </p>
            <div className="space-y-2">
              {followUpQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleFollowUpClick(question)}
                  className="block w-full text-left px-4 py-3 glass rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-sm text-white/80 hover:text-white hover-lift"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-3 hover:border-white/20 transition-all">
            {/* Image Preview - Inside input box */}
            {imagePreview && (
              <div className="flex items-start gap-2 mb-3">
                <div className="relative group">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  {/* Edit button overlay - click to change image */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -top-1 -left-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                    title="Change image"
                  >
                    <svg className="w-3 h-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  {/* Remove button */}
                  <button
                    onClick={clearImage}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-md"
                    title="Remove image"
                  >
                    <FiX size={12} className="text-gray-700" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
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
                className="p-2.5 text-white/50 hover:text-white rounded-xl hover:bg-white/10 transition-all flex-shrink-0"
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
                className="flex-1 px-4 py-3 bg-transparent text-white resize-none focus:outline-none placeholder-white/30 min-h-[48px] max-h-[120px]"
                rows={1}
                disabled={loading}
              />

              {/* Voice Input */}
              <MicInput onTranscript={handleVoiceTranscript} />

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || loading}
                className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0 btn-shine"
              >
                <FiSend size={20} />
              </button>
            </div>
          </div>
          <p className="text-center text-white/20 text-xs mt-3">Press Enter to send • Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
