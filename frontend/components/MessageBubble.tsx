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
            ? 'bg-white text-black'
            : 'bg-white/5 text-white border border-white/10'
        }`}
      >
        {!isUser && (
          <div className="font-semibold text-white/40 text-xs mb-2">Assistant</div>
        )}
        <div className={`${isUser ? 'text-black' : 'text-white'}`}>
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
          <div className={`text-xs mt-2 ${isUser ? 'text-black/60' : 'text-white/40'}`}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
