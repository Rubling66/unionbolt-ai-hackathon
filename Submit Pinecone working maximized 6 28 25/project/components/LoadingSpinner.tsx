'use client';

import { Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'neon' | 'minimal';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  text,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'neon') {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center pulse-glow">
            <Zap className="w-8 h-8 text-green-500 animate-pulse" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-2 border-green-500/30 rounded-full animate-spin border-t-green-500" />
        </div>
        {text && (
          <p className="text-green-500 font-medium animate-pulse">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
        {text && (
          <span className={cn("text-muted-foreground", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className="relative">
        <Loader2 className={cn("animate-spin text-green-500", sizeClasses[size])} />
        <div className={cn(
          "absolute inset-0 animate-ping opacity-75",
          sizeClasses[size]
        )}>
          <Loader2 className={cn("text-green-500/50", sizeClasses[size])} />
        </div>
      </div>
      {text && (
        <p className={cn("text-muted-foreground text-center", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
}