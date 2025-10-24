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
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-100 border border-gray-700'
        }`}
      >
        {!isUser && (
          <div className="font-semibold text-gray-400 text-xs mb-2">Assistant</div>
        )}
        <div className={`${isUser ? 'text-white' : 'text-gray-100'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown 
              className="prose prose-sm prose-invert max-w-none markdown-content"
              components={{
                // Customize bullet points
                ul: ({node, ...props}) => (
                  <ul className="list-disc ml-4 my-2 space-y-1" {...props} />
                ),
                // Customize list items
                li: ({node, ...props}) => (
                  <li className="ml-2" {...props} />
                ),
                // Customize paragraphs
                p: ({node, ...props}) => (
                  <p className="my-2" {...props} />
                ),
                // Customize bold text
                strong: ({node, ...props}) => (
                  <strong className="font-bold text-blue-400" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
        {timestamp && (
          <div className={`text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
