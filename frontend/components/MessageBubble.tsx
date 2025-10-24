'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, timestamp }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 message-slide-in`}>
      <div
        className={`max-w-3xl px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <div className="font-bold text-primary-600 text-sm">🤖 Assistant</div>
          )}
          {isUser && (
            <div className="font-bold text-white text-sm">You</div>
          )}
        </div>
        <div className={`mt-1 ${isUser ? 'text-white' : 'text-gray-800'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown className="prose prose-sm max-w-none">
              {content}
            </ReactMarkdown>
          )}
        </div>
        {timestamp && (
          <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
