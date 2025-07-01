'use client';

import { Zap, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TokenUsageDisplayProps {
  totalTokens: number;
  conversationLength: number;
  averageResponseTime?: number;
}

export default function TokenUsageDisplay({ 
  totalTokens, 
  conversationLength, 
  averageResponseTime 
}: TokenUsageDisplayProps) {
  const formatTokenCount = (tokens: number) => {
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}k`;
    return `${(tokens / 1000000).toFixed(1)}M`;
  };

  const getEfficiencyColor = (tokens: number, messages: number) => {
    if (messages === 0) return 'text-muted-foreground';
    const avgTokensPerMessage = tokens / messages;
    if (avgTokensPerMessage < 50) return 'text-green-500';
    if (avgTokensPerMessage < 100) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getEfficiencyLabel = (tokens: number, messages: number) => {
    if (messages === 0) return 'No data';
    const avgTokensPerMessage = tokens / messages;
    if (avgTokensPerMessage < 50) return 'Excellent';
    if (avgTokensPerMessage < 100) return 'Good';
    return 'High usage';
  };

  return (
    <Card className="bg-card/30 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-500" />
          Token Usage Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Tokens */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Tokens</span>
          <div className="text-right">
            <div className="text-lg font-bold neon-text">
              {formatTokenCount(totalTokens)}
            </div>
            <div className="text-xs text-muted-foreground">
              {conversationLength} messages
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Efficiency</span>
          <div className="text-right">
            <Badge 
              variant="outline" 
              className={`${getEfficiencyColor(totalTokens, conversationLength)} border-current`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {getEfficiencyLabel(totalTokens, conversationLength)}
            </Badge>
            {conversationLength > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(totalTokens / conversationLength)} avg/msg
              </div>
            )}
          </div>
        </div>

        {/* Response Time */}
        {averageResponseTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Response</span>
            <div className="text-right">
              <div className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {averageResponseTime.toFixed(1)}s
              </div>
            </div>
          </div>
        )}

        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Context Window</span>
          <div className="text-right">
            <Badge variant="outline" className="border-blue-500/50 text-blue-500">
              Last 5 messages
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              Token optimized
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}