'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Video, VideoOff, Phone, PhoneOff, User, Clock } from 'lucide-react';
import { tavusAPI } from '@/lib/tavus-api';

interface ConversationState {
  id: string | null;
  url: string | null;
  status: 'idle' | 'creating' | 'connecting' | 'active' | 'ended' | 'error';
  error: string | null;
  duration: number;
}

export default function TavusVideoChat() {
  const [conversation, setConversation] = useState<ConversationState>({
    id: null,
    url: null,
    status: 'idle',
    error: null,
    duration: 0
  });
  
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const startConversation = async () => {
    try {
      setConversation(prev => ({ ...prev, status: 'creating', error: null }));

      // Create conversation with Tavus API
      const response = await tavusAPI.createConversation();
      
      setConversation(prev => ({
        ...prev,
        id: response.conversation_id,
        url: response.conversation_url,
        status: 'connecting'
      }));

      // Join the conversation
      if (videoContainerRef.current && response.conversation_url) {
        await tavusAPI.joinConversation(response.conversation_url, videoContainerRef.current);
        
        setConversation(prev => ({ ...prev, status: 'active', duration: 0 }));

        // Set up event listeners for the Daily call
        const dailyCall = tavusAPI.getDailyCall();
        if (dailyCall) {
          dailyCall.on('left-meeting', () => {
            setConversation(prev => ({ ...prev, status: 'ended' }));
          });

          dailyCall.on('error', (error: any) => {
            console.error('Daily call error:', error);
            setConversation(prev => ({
              ...prev,
              status: 'error',
              error: 'Video call error occurred'
            }));
          });
        }
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
      await tavusAPI.leaveConversation();
      
      if (conversation.id) {
        await tavusAPI.endConversation(conversation.id);
      }

      // Clear video container
      if (videoContainerRef.current) {
        videoContainerRef.current.innerHTML = '';
      }

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
    setConversation({
      id: null,
      url: null,
      status: 'idle',
      error: null,
      duration: 0
    });
  };

  const getStatusBadge = () => {
    switch (conversation.status) {
      case 'idle':
        return <Badge variant="secondary">Ready</Badge>;
      case 'creating':
        return <Badge variant="default">Creating...</Badge>;
      case 'connecting':
        return <Badge variant="default">Connecting...</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">Live</Badge>;
      case 'ended':
        return <Badge variant="outline">Ended</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle className="text-2xl">Shane Keelan AI Agent</CardTitle>
                <CardDescription>
                  Real-time video conversation with Shane Keelan persona
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge()}
              {conversation.status === 'active' && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(conversation.duration)}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversation.error && (
            <Alert variant="destructive">
              <AlertDescription>{conversation.error}</AlertDescription>
            </Alert>
          )}

          {/* Video Container */}
          <div className="relative">
            <div
              ref={videoContainerRef}
              className="w-full h-96 bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {conversation.status === 'idle' && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Ready to start conversation</p>
                    <p className="text-sm">Click "Start Conversation" to begin</p>
                  </div>
                </div>
              )}
              
              {(conversation.status === 'creating' || conversation.status === 'connecting') && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-medium">
                      {conversation.status === 'creating' ? 'Creating conversation...' : 'Connecting...'}
                    </p>
                    <p className="text-sm">Please wait while we set up your session</p>
                  </div>
                </div>
              )}

              {conversation.status === 'ended' && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Conversation ended</p>
                    <p className="text-sm">Thank you for chatting with Shane Keelan</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {conversation.status === 'idle' && (
              <Button onClick={startConversation} size="lg" className="px-8">
                <Phone className="h-5 w-5 mr-2" />
                Start Conversation
              </Button>
            )}

            {(conversation.status === 'creating' || conversation.status === 'connecting') && (
              <Button disabled size="lg" className="px-8">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {conversation.status === 'creating' ? 'Creating...' : 'Connecting...'}
              </Button>
            )}

            {conversation.status === 'active' && (
              <Button onClick={endConversation} variant="destructive" size="lg" className="px-8">
                <PhoneOff className="h-5 w-5 mr-2" />
                End Conversation
              </Button>
            )}

            {(conversation.status === 'ended' || conversation.status === 'error') && (
              <Button onClick={resetConversation} variant="outline" size="lg" className="px-8">
                <Video className="h-5 w-5 mr-2" />
                Start New Conversation
              </Button>
            )}
          </div>

          {/* Conversation Info */}
          {conversation.id && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Conversation ID: {conversation.id}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}