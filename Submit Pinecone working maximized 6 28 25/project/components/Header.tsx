'use client';

import { useState } from 'react';
import { Zap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DatabaseStatus from '@/components/DatabaseStatus';
import { useDatabaseStatus } from '@/hooks/use-database-status';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { status: databaseStatus } = useDatabaseStatus();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'AI Chat', href: '/ai-chat' },
    { name: 'Video Steward', href: '/dashboard/video-steward' },
    { name: 'Documents', href: '/documents' },
    { name: 'Profile', href: '/profile' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const handleNavigation = (href: string) => {
    window.location.href = href;
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <div className="relative">
              <Zap className="h-8 w-8 text-green-500 neon-glow" />
              <div className="absolute inset-0 h-8 w-8 text-green-500 opacity-50 animate-ping">
                <Zap className="h-8 w-8" />
              </div>
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">UNIONBOLT</span>
              <span className="neon-text ml-1">AI</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="text-muted-foreground hover:text-green-500 transition-colors duration-200 font-medium"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <DatabaseStatus />
            {databaseStatus.connected && (
                <Badge variant="outline" className="border-green-500/50 text-green-500">
                  {databaseStatus.assistantId}
                </Badge>
              )}
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-white"
              onClick={() => handleNavigation('/profile')}
            >
              Profile
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600 text-black font-semibold neon-glow"
              onClick={() => handleNavigation('/ai-chat')}
            >
              Try AI Chat
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-300">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-muted-foreground hover:text-green-500 transition-colors duration-200 font-medium text-left"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <DatabaseStatus />
                  {databaseStatus.connected && (
                     <Badge variant="outline" className="border-green-500/50 text-green-500">
                       {databaseStatus.assistantId}
                     </Badge>
                   )}
                </div>
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-white justify-start"
                  onClick={() => handleNavigation('/profile')}
                >
                  Profile
                </Button>
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold justify-start"
                  onClick={() => handleNavigation('/ai-chat')}
                >
                  Try AI Chat
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}