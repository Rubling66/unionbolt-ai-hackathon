'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Brain, Users, ChevronDown, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import DatabaseStatus from '@/components/DatabaseStatus';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDatabaseStatus } from '@/hooks/use-database-status';
import { cn } from '@/lib/utils';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { status: databaseStatus } = useDatabaseStatus();

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner 
          variant="neon" 
          text="Initializing UnionBolt AI..." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Floating Bolt Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative floating-animation">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center pulse-glow">
                  <Zap className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">POWER OF </span>
              <span className="neon-text">KNOWLEDGE</span>
              <span className="text-green-500 text-lg align-super">®</span>
            </h1>

            {/* Subheadings */}
            <div className="space-y-4 mb-12">
              <p className="text-xl sm:text-2xl text-gray-300 font-medium">
                Knowledge is Power.
              </p>
              <p className="text-xl sm:text-2xl text-gray-300 font-medium">
                Power is Protection.
              </p>
            </div>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI-driven knowledge management. UnionBolt AI transforms how organizations 
              learn, protect, and grow through intelligent automation and advanced analytics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 text-lg neon-glow group"
                onClick={() => window.location.href = '/dashboard'}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-green-500 text-green-500 hover:bg-green-500/10 px-8 py-4 text-lg"
                onClick={() => window.location.href = '/ai-chat'}
              >
                Try AI Chat
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {databaseStatus.connected ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="text-3xl font-bold neon-text mb-2">
                  {databaseStatus.loading ? '...' : databaseStatus.connected ? '✓' : '⚠'}
                </div>
                <div className="text-muted-foreground">
                  {databaseStatus.loading ? 'Connecting...' : databaseStatus.connected ? 'DB Connected' : 'DB Reconnecting'}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Brain className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold neon-text mb-2">20M</div>
                <div className="text-muted-foreground">Token Capacity</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-3xl font-bold neon-text mb-2">24/7</div>
                <div className="text-muted-foreground">
                  {databaseStatus.connected ? 'AI Support' : 'Reconnecting...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-green-500" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gradient-text">Intelligent Solutions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover how UnionBolt AI empowers your organization with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Assistant",
                description: "Advanced AI-powered assistance for complex problem-solving and decision making.",
                color: "text-green-500",
                bgColor: "bg-green-500/10",
                href: "/ai-chat"
              },
              {
                icon: Shield,
                title: "Safety Center",
                description: "Comprehensive safety protocols and guidelines to protect your organization.",
                color: "text-orange-500",
                bgColor: "bg-orange-500/10",
                href: "/dashboard"
              },
              {
                icon: Users,
                title: "Member Portal",
                description: "Complete member management with profiles, benefits, and training tracking.",
                color: "text-blue-500",
                bgColor: "bg-blue-500/10",
                href: "/profile"
              },
              {
                icon: TrendingUp,
                title: "Analytics Hub",
                description: "Real-time insights and performance metrics to optimize your operations.",
                color: "text-purple-500",
                bgColor: "bg-purple-500/10",
                href: "/documents"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="bg-card/50 border-border hover:border-green-500/50 transition-all duration-300 group cursor-pointer"
                onClick={() => window.location.href = feature.href}
              >
                <CardContent className="p-6 text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform",
                    feature.bgColor
                  )}>
                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-green-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gradient-text">Trusted by Union Leaders</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how UnionBolt AI is transforming union operations across the country
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "UnionBolt AI has revolutionized how we handle member inquiries. The AI assistant provides accurate, instant responses about safety protocols and contract details.",
                author: "Sarah Johnson",
                title: "Union Steward, Local 1234 IBEW",
                rating: 5
              },
              {
                quote: "The member dashboard gives us unprecedented visibility into training progress and safety compliance. It's like having a dedicated analyst for every member.",
                author: "Mike Rodriguez",
                title: "Training Director, Local 567",
                rating: 5
              },
              {
                quote: "Document management has never been easier. Our members can access contracts, safety manuals, and training materials instantly through the AI-powered search.",
                author: "Lisa Chen",
                title: "Business Agent, Local 890",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-card/50 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="h-6 w-6 text-green-500" />
              <span className="text-lg font-bold">
                <span className="text-white">UNIONBOLT</span>
                <span className="neon-text ml-1">AI</span>
              </span>
            </div>
            <div className="mb-4 md:mb-0">
              <DatabaseStatus />
            </div>
            <div className="text-muted-foreground text-sm">
              © 2024 UnionBolt AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}