'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Video, AlertCircle } from 'lucide-react';

interface ConversationData {
  conversationUrl: string;
  conversationId: string;
}

export function TavusVideoAgent() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tavus/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replicaId: 'r92debe21318',
          personaId: 'pf3f7150ee47'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.statusText}`);
      }
      
      const data = await response.json();
      setConversationData(data);
      setIsActive(true);
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start video conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = () => {
    setIsActive(false);
    setConversationData(null);
    setError(null);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Video className="h-5 w-5" />
          Talk to Reuben Martinez - Union Advisor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {!isActive ? (
          <div className="text-center space-y-4">
            <p className="text-gray-300">
              Get personalized advice from Reuben, a senior union advisor with 20+ years 
              of experience in workplace safety, grievances, and worker rights.
            </p>
            <Button 
              onClick={startConversation} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Conversation...
                </>
              ) : (
                'Start Video Conversation'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <iframe
                src={conversationData?.conversationUrl}
                className="w-full h-96 rounded-lg border border-gray-600"
                allow="camera; microphone; autoplay"
                title="Tavus Video Conversation"
              />
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={endConversation}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                End Conversation
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}