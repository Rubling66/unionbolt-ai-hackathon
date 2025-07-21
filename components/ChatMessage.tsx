'use client';

import { Bot, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg transition-all duration-200",
      isUser ? "flex-row-reverse bg-green-500/5" : "bg-muted/30"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-green-500/20 border border-green-500/30" 
          : "bg-blue-500/20 border border-blue-500/30"
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-green-500" />
        ) : (
          <Bot className="w-5 h-5 text-blue-500" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 space-y-2",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message Text */}
        <div className={cn(
          "inline-block max-w-[85%] p-3 rounded-lg text-sm leading-relaxed",
          isUser 
            ? "bg-green-500 text-black font-medium" 
            : "bg-card border border-border text-foreground"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <div className={cn(
          "flex items-center gap-1 text-xs text-muted-foreground",
          isUser ? "justify-end" : "justify-start"
        )}>
          <Clock className="w-3 h-3" />
          <span>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}