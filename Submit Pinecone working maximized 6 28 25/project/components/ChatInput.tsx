'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about union policies, safety procedures, training..."
            className={cn(
              "min-h-[60px] max-h-[120px] resize-none",
              "bg-muted/50 border-border focus:border-green-500/50",
              "placeholder:text-muted-foreground/70"
            )}
            disabled={isLoading || disabled}
            maxLength={1000}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className={cn(
              input.length > 800 && "text-yellow-500",
              input.length > 950 && "text-red-500"
            )}>
              {input.length}/1000
            </span>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className={cn(
            "h-[60px] px-6 bg-green-500 hover:bg-green-600 text-black",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200 neon-glow"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
}