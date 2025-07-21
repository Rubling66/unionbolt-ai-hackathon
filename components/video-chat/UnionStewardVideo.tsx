'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  User, 
  Clock, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Mic,
  MicOff
} from 'lucide-react';

interface ConversationState {
  id: string | null;
  url: string | null;
  status: 'idle' | 'creating' | 'connecting' | 'active' | 'ended' | 'error';
  error: string | null;
  duration: number;
}

interface ConversationResponse {
  success: boolean;
  conversation: {
    id: string;
    url: string;
    status: string;
  };
  persona: {
    personaId: string;
    replicaId: string;
    name: string;
    role: string;
  };
  message: string;
}

export default function UnionStewardVideo() {
  const [conversation, setConversation] = useState<ConversationState>({
    id: null,
    url: null,
    status: 'idle',
    error: null,
    duration: 0
  });
  
  const [isMuted, setIsMuted] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Update conversation duration
  useEffect(() => {
    if (conversation.status === 'active') {
      durationIntervalRef.current = setInterval(() => {
        setConversation(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [conversation.status]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createConversation = useCallback(async (): Promise<ConversationResponse> => {
    const response = await fetch('/api/tavus/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        options: {
          properties: {
            max_call_duration: 1800, // 30 minutes
            enable_recording: false,
            enable_transcription: true,
          }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create conversation');
    }

    return response.json();
  }, []);

  const createVideoIframe = useCallback((roomUrl: string) => {
    if (!videoContainerRef.current) return;

    // Safely clear existing content
    try {
      while (videoContainerRef.current.firstChild) {
        videoContainerRef.current.removeChild(videoContainerRef.current.firstChild);
      }
    } catch (error) {
      console.warn('Error clearing video container:', error);
      // Fallback to innerHTML if removeChild fails
      videoContainerRef.current.innerHTML = '';
    }

    // Create iframe for Daily.js
    const iframe = document.createElement('iframe');
    iframe.src = roomUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.allow = 'camera; microphone; fullscreen; display-capture';
    iframe.allowFullscreen = true;

    try {
      videoContainerRef.current.appendChild(iframe);
      iframeRef.current = iframe;
    } catch (error) {
      console.error('Error appending iframe:', error);
      return;
    }

    // Listen for iframe messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== new URL(roomUrl).origin) return;
      
      if (event.data.type === 'daily-method-call-result') {
        console.log('Daily.js event:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const startConversation = async () => {
    try {
      setConversation(prev => ({ ...prev, status: 'creating', error: null }));

      // Create conversation with Tavus API
      const response = await createConversation();
      
      setConversation(prev => ({
        ...prev,
        id: response.conversation.id,
        url: response.conversation.url,
        status: 'connecting'
      }));

      // Create and join video call
      if (response.conversation.url) {
        createVideoIframe(response.conversation.url);
        
        // Simulate connection delay
        setTimeout(() => {
          setConversation(prev => ({ ...prev, status: 'active', duration: 0 }));
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setConversation(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start conversation'
      }));
    }
  };

  const endConversation = async () => {
    try {
      // Safely clear video container
      if (videoContainerRef.current) {
        try {
          while (videoContainerRef.current.firstChild) {
            videoContainerRef.current.removeChild(videoContainerRef.current.firstChild);
          }
        } catch (error) {
          console.warn('Error clearing video container on end:', error);
          // Fallback to innerHTML if removeChild fails
          videoContainerRef.current.innerHTML = '';
        }
      }
      
      iframeRef.current = null;

      setConversation({
        id: null,
        url: null,
        status: 'ended',
        error: null,
        duration: 0
      });
    } catch (error) {
      console.error('Failed to end conversation:', error);
      setConversation(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to end conversation properly'
      }));
    }
  };

  const resetConversation = () => {
    // Safely clear video container before reset
    if (videoContainerRef.current) {
      try {
        while (videoContainerRef.current.firstChild) {
          videoContainerRef.current.removeChild(videoContainerRef.current.firstChild);
        }
      } catch (error) {
        console.warn('Error clearing video container on reset:', error);
        // Fallback to innerHTML if removeChild fails
        videoContainerRef.current.innerHTML = '';
      }
    }
    
    iframeRef.current = null;
    
    setConversation({
      id: null,
      url: null,
      status: 'idle',
      error: null,
      duration: 0
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would send a message to the iframe
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'daily-method-call',
        method: isMuted ? 'setLocalAudio' : 'setLocalAudio',
        args: [!isMuted]
      }, '*');
    }
  };

  const getStatusBadge = () => {
    switch (conversation.status) {
      case 'idle':
        return <Badge variant="secondary" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Ready</Badge>;
      case 'creating':
        return <Badge variant="default" className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Creating...</Badge>;
      case 'connecting':
        return <Badge variant="default" className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Connecting...</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500 flex items-center gap-1"><Video className="h-3 w-3" />Live</Badge>;
      case 'ended':
        return <Badge variant="outline" className="flex items-center gap-1"><VideoOff className="h-3 w-3" />Ended</Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
                  UnionBolt Job Steward Support
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Labor Rights Advocate • Real-time Video Consultation
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge()}
              {conversation.status === 'active' && (
                <div className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatDuration(conversation.duration)}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {conversation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{conversation.error}</AlertDescription>
            </Alert>
          )}

          {/* Video Container */}
          <div className="relative">
            <div
              ref={videoContainerRef}
              className="w-full h-[500px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg"
            >
              {conversation.status === 'idle' && (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-blue-500/20 rounded-full mx-auto w-fit">
                      <Shield className="h-16 w-16 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white mb-2">
                        Ready to Connect with Your Job Steward
                      </p>
                      <p className="text-gray-400">
                        Get expert labor rights advice and workplace support
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {(conversation.status === 'creating' || conversation.status === 'connecting') && (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-16 w-16 mx-auto animate-spin text-blue-400" />
                    <div>
                      <p className="text-xl font-semibold text-white mb-2">
                        {conversation.status === 'creating' ? 'Preparing Your Session...' : 'Connecting to Steward...'}
                      </p>
                      <p className="text-gray-400">
                        Please wait while we set up your secure consultation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {conversation.status === 'ended' && (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-green-500/20 rounded-full mx-auto w-fit">
                      <CheckCircle className="h-16 w-16 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white mb-2">
                        Session Completed
                      </p>
                      <p className="text-gray-400">
                        Thank you for using UnionBolt Job Steward Support
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center space-x-4">
            {conversation.status === 'idle' && (
              <Button 
                onClick={startConversation} 
                size="lg" 
                className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Phone className="h-5 w-5 mr-2" />
                Start Consultation
              </Button>
            )}

            {(conversation.status === 'creating' || conversation.status === 'connecting') && (
              <Button disabled size="lg" className="px-8">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {conversation.status === 'creating' ? 'Preparing...' : 'Connecting...'}
              </Button>
            )}

            {conversation.status === 'active' && (
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={toggleMute} 
                  variant="outline" 
                  size="lg"
                  className={isMuted ? 'bg-red-50 border-red-200 text-red-600' : ''}
                >
                  {isMuted ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button 
                  onClick={endConversation} 
                  variant="destructive" 
                  size="lg" 
                  className="px-8"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End Session
                </Button>
              </div>
            )}

            {(conversation.status === 'ended' || conversation.status === 'error') && (
              <Button 
                onClick={resetConversation} 
                variant="outline" 
                size="lg" 
                className="px-8 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Video className="h-5 w-5 mr-2" />
                Start New Session
              </Button>
            )}
          </div>

          {/* Session Info */}
          {conversation.id && (
            <div className="text-center text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="font-mono">Session ID: {conversation.id}</p>
            </div>
          )}

          {/* Features Info */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Secure & Private</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">End-to-end encrypted consultations</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <User className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold text-green-900 dark:text-green-100">Expert Guidance</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Professional labor rights advocacy</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">24/7 Available</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Round-the-clock support when you need it</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}