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
        className={`max-w-3xl px-5 py-4 rounded-2xl ${
          isUser
            ? 'bg-white/10 border border-white/20 text-white'
            : 'glass text-white'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">✨</div>
            <span className="font-medium text-white/60 text-xs">Assistant</span>
          </div>
        )}
        <div className="text-white/90">
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown 
              className="prose prose-sm prose-invert max-w-none markdown-content"
              components={{
                ul: ({node, ...props}) => (
                  <ul className="list-disc ml-4 my-2 space-y-1" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="ml-2" {...props} />
                ),
                p: ({node, ...props}) => (
                  <p className="my-2" {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className="font-bold text-white" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
        {timestamp && (
          <div className="text-xs mt-3 text-white/40">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
