'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, AlertCircle, Zap, Download, MessageSquare, Sparkles, Clock, Copy, Check, Video, VideoOff } from 'lucide-react';
import { UnionStewardVideo } from '@/components/UnionStewardVideo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import ConversationHistory from '@/components/ConversationHistory';
import { useChatPersistence } from '@/hooks/use-chat-persistence';
import { exportConversations } from '@/lib/chat-persistence';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
  status?: 'sending' | 'sent' | 'error';
}

interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

interface ChatResponse {
  message: string;
  tokenUsage: TokenUsage;
  conversationId: string;
  status: string;
  error?: string;
}

// Suggested prompts for common union questions
const SUGGESTED_PROMPTS = [
  "What are my rights during a disciplinary meeting?",
  "How do I file a grievance?",
  "What safety equipment is required for my job?",
  "How does overtime pay work in our contract?",
  "What benefits am I entitled to as a union member?",
  "How do I contact my union steward?",
  "What training programs are available?",
  "How does the seniority system work?"
];

export default function AIChatPage() {
  const {
    conversations,
    currentConversationId,
    messages: persistedMessages,
    totalTokens: persistedTotalTokens,
    startNewConversation,
    switchToConversation,
    addMessage,
    clearCurrentConversation
  } = useChatPersistence();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    loading: boolean;
    error?: string;
  }>({ connected: false, loading: true });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showVideoChat, setShowVideoChat] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [persistedMessages, isTyping]);

  // Focus input on mount and when conversation changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentConversationId]);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Show suggestions when there are no messages
  useEffect(() => {
    setShowSuggestions(persistedMessages.length === 0);
  }, [persistedMessages.length]);

  // Check database connection status
  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/test-connection');
      const result = await response.json();
      
      if (result.status === 'success') {
        setConnectionStatus({
          connected: result.data.connected,
          loading: false,
          error: result.data.error
        });
      } else {
        setConnectionStatus({
          connected: false,
          loading: false,
          error: result.error
        });
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        loading: false,
        error: 'Connection check failed'
      });
    }
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    // Clear input and hide suggestions
    setInput('');
    setShowSuggestions(false);
    setIsLoading(true);
    setError(null);

    // Add user message with sending status
    const userMessage = addMessage({
      role: 'user',
      content,
      timestamp: new Date(),
    });

    try {
      // Show typing indicator
      setIsTyping(true);
      
      // Keep only last 5 messages for context (including the new user message)
      const recentMessages = [...persistedMessages, userMessage].slice(-5);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      // Handle both success and error responses
      if (data.status === 'error') {
        throw new Error(data.error || 'API returned error status');
      }

      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add assistant message
      addMessage({
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        tokens: data.tokenUsage.total,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Chat error:', err);
      
      // Add fallback assistant message for better UX
      addMessage({
        role: 'assistant',
        content: "I'm experiencing technical difficulties. For immediate union assistance, please contact your union steward or office directly. I'll try to reconnect shortly.",
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleExportConversation = () => {
    const exportData = exportConversations();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unionbolt-conversations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const formatTokenCount = (tokens: number) => {
    if (tokens < 1000) return tokens.toString();
    return `${(tokens / 1000).toFixed(1)}k`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">AI Chat Assistant</h1>
              <p className="text-muted-foreground">
                Token-efficient conversations with DeepSeek R1 Agent
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-muted-foreground">Total Tokens</div>
                <div className="text-lg font-bold neon-text">
                  {formatTokenCount(persistedTotalTokens)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportConversation}
                className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCurrentConversation}
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Conversation History - Hidden on mobile, sidebar on desktop */}
            <div className="hidden lg:block">
              <ConversationHistory
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={switchToConversation}
                onDeleteConversation={(id) => {
                  // Handle deletion through the hook
                  const conv = conversations.find(c => c.id === id);
                  if (conv) {
                    // This will be handled by the persistence hook
                  }
                }}
                onNewConversation={startNewConversation}
              />
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="bg-card/50 border-border h-[600px] sm:h-[700px] flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-green-500" />
                      <span>{showVideoChat ? 'Video Steward Chat' : 'DeepSeek R1 Agent'}</span>
                      {connectionStatus.loading ? (
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2" />
                          Connecting...
                        </Badge>
                      ) : connectionStatus.connected ? (
                        <Badge variant="outline" className="border-green-500/50 text-green-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500/50 text-red-500">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                          Offline
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={showVideoChat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowVideoChat(!showVideoChat)}
                        className={cn(
                          "h-8 px-3 transition-all duration-200",
                          showVideoChat 
                            ? "bg-green-500 hover:bg-green-600 text-black" 
                            : "hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30"
                        )}
                      >
                        {showVideoChat ? (
                          <><VideoOff className="w-3 h-3 mr-1" />Exit Video</>
                        ) : (
                          <><Video className="w-3 h-3 mr-1" />Video Chat</>
                        )}
                      </Button>
                      <Badge variant="outline" className="border-green-500/50 text-green-500">
                        Memory: Last 5 messages
                      </Badge>
                      <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                        {persistedMessages.length} messages
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Video Chat Component */}
                   {showVideoChat && (
                     <div className="flex-1 flex flex-col">
                       <div className="border-b border-border p-4 bg-muted/30">
                         <div className="text-center">
                           <Video className="w-8 h-8 text-green-500 mx-auto mb-2" />
                           <h3 className="text-lg font-semibold mb-1">Video Steward Chat Active</h3>
                           <p className="text-sm text-muted-foreground">
                             You're now in video chat mode with your Union Steward. Use the video interface below to communicate.
                           </p>
                         </div>
                       </div>
                       <div className="flex-1">
                         <UnionStewardVideo />
                       </div>
                     </div>
                   )}
                   
                   {/* Messages Area - Hidden when video chat is active */}
                   {!showVideoChat && (
                     <ScrollArea className="flex-1 px-4 sm:px-6" ref={scrollAreaRef}>
                       <div className="space-y-4 pb-4">
                      {persistedMessages.length === 0 && !showSuggestions && (
                        <div className="text-center py-12">
                          <Bot className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground mb-2">
                            {connectionStatus.connected 
                              ? "Start a conversation with the DeepSeek R1 agent"
                              : "DeepSeek R1 agent is currently offline"
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {connectionStatus.connected
                              ? "Try asking about union policies, safety procedures, or training requirements"
                              : "Basic responses available. Full functionality will return when database connection is restored."
                            }
                          </p>
                        </div>
                      )}

                      {/* Suggested Prompts */}
                      {showSuggestions && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                          <div className="text-center py-8">
                            <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                              Choose a topic below or ask your own question
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SUGGESTED_PROMPTS.map((prompt, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestedPrompt(prompt)}
                                className="p-3 text-left bg-muted/30 hover:bg-muted/50 border border-border hover:border-green-500/30 rounded-lg transition-all duration-200 group"
                              >
                                <div className="flex items-start space-x-2">
                                  <MessageSquare className="w-4 h-4 text-green-500 mt-0.5 group-hover:scale-110 transition-transform" />
                                  <span className="text-sm text-foreground group-hover:text-green-400 transition-colors">
                                    {prompt}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Messages */}
                      {persistedMessages.map((message, index) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-green-500" />
                            </div>
                          )}
                          
                          <div
                            className={cn(
                              "max-w-[85%] sm:max-w-[80%] rounded-lg px-4 py-3 group relative",
                              message.role === 'user'
                                ? 'bg-green-500 text-black'
                                : 'bg-muted text-foreground border border-border'
                            )}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            
                            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {message.tokens && (
                                  <div className="flex items-center space-x-1">
                                    <Zap className="w-3 h-3" />
                                    <span>{message.tokens} tokens</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Copy button */}
                              <button
                                onClick={() => handleCopyMessage(message.id, message.content)}
                                className={cn(
                                  "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10",
                                  message.role === 'user' ? 'hover:bg-black/10' : 'hover:bg-white/10'
                                )}
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          {message.role === 'user' && (
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-500" />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="flex items-start space-x-3 animate-in slide-in-from-bottom-2 duration-300">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="bg-muted rounded-lg px-4 py-3 border border-border">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200" />
                              </div>
                              <span className="text-sm text-muted-foreground">DeepSeek R1 is thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  )}
                  
                  {/* Error Display */}
                  {error && (
                    <div className="mx-4 sm:mx-6 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center space-x-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Input Area - Hidden when video chat is active */}
                  {!showVideoChat && (
                    <div className="border-t border-border p-4 sm:p-6">
                      <div className="flex items-end space-x-3">
                        <div className="flex-1 space-y-2">
                          <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={connectionStatus.connected 
                              ? "Ask about union policies, safety, training..."
                              : "Ask about union topics (limited responses while database offline)..."
                            }
                            className={cn(
                              "min-h-[60px] max-h-[120px] resize-none",
                              "bg-background border-border focus:border-green-500",
                              "placeholder:text-muted-foreground/70"
                            )}
                            disabled={isLoading}
                            maxLength={1000}
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Press Enter to send, Shift+Enter for new line</span>
                            <div className="flex items-center space-x-2">
                              <span className={cn(
                                input.length > 800 && "text-yellow-500",
                                input.length > 950 && "text-red-500"
                              )}>
                                {input.length}/1000
                              </span>
                              {!connectionStatus.connected && (
                                <span className="text-yellow-500">• Offline Mode</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleSendMessage()}
                          disabled={!input.trim() || isLoading}
                          className={cn(
                            "h-[60px] px-6 transition-all duration-200",
                            connectionStatus.connected
                              ? "bg-green-500 hover:bg-green-600 text-black neon-glow"
                              : "bg-yellow-500 hover:bg-yellow-600 text-black",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}