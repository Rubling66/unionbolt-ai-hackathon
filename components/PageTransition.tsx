'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative">
      {/* Loading overlay */}
      <div className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="relative">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center pulse-glow">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className={cn(
        "transition-all duration-300",
        isLoading ? "opacity-50 scale-95" : "opacity-100 scale-100"
      )}>
        {children}
      </div>
    </div>
  );
}