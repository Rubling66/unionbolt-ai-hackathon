'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Trash2, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StoredConversation {
  id: string;
  title: string;
  messages: any[];
  totalTokens: number;
  lastActivity: Date;
  created: Date;
}

interface ConversationHistoryProps {
  conversations: StoredConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation
}: ConversationHistoryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatTokenCount = (tokens: number) => {
    if (tokens < 1000) return tokens.toString();
    return `${(tokens / 1000).toFixed(1)}k`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
  );

  return (
    <Card className="bg-card/50 border-border h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Conversations</CardTitle>
          <Button
            size="sm"
            onClick={onNewConversation}
            className="bg-green-500 hover:bg-green-600 text-black"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="space-y-2 p-4 pt-0">
            {sortedConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-sm">No conversations yet</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Start a new conversation to begin
                </p>
              </div>
            ) : (
              sortedConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                    currentConversationId === conversation.id
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-muted/30 border-border hover:bg-muted/50 hover:border-green-500/20"
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                  onMouseEnter={() => setHoveredId(conversation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Delete Button */}
                  {hoveredId === conversation.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}

                  {/* Conversation Content */}
                  <div className="space-y-2">
                    {/* Title */}
                    <h3 className={cn(
                      "text-sm font-medium line-clamp-2 pr-8",
                      currentConversationId === conversation.id
                        ? "text-green-400"
                        : "text-foreground"
                    )}>
                      {conversation.title}
                    </h3>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(conversation.lastActivity)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">
                          {conversation.messages.length} msgs
                        </Badge>
                        {conversation.totalTokens > 0 && (
                          <div className="flex items-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>{formatTokenCount(conversation.totalTokens)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview of last message */}
                    {conversation.messages.length > 0 && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {conversation.messages[conversation.messages.length - 1]?.content?.slice(0, 100)}
                        {conversation.messages[conversation.messages.length - 1]?.content?.length > 100 && '...'}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}