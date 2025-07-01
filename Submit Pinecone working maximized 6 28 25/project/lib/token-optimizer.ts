// Token optimization utilities for efficient AI conversations

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface OptimizedMessage {
  role: 'user' | 'assistant';
  content: string;
  compressed?: boolean;
}

// Estimate token count (rough approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Compress message content while preserving meaning
export function compressMessage(content: string): string {
  return content
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove redundant phrases
    .replace(/please|thank you|could you|would you/gi, '')
    // Trim
    .trim();
}

// Smart context trimming for union-specific conversations
export function trimContext(messages: OptimizedMessage[], maxTokens: number = 1000): OptimizedMessage[] {
  let totalTokens = 0;
  const trimmedMessages: OptimizedMessage[] = [];
  
  // Start from the most recent message and work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokens(message.content);
    
    if (totalTokens + messageTokens <= maxTokens) {
      trimmedMessages.unshift(message);
      totalTokens += messageTokens;
    } else {
      break;
    }
  }
  
  return trimmedMessages;
}

// Format union-specific queries for better AI understanding
export function formatUnionQuery(content: string): string {
  const unionKeywords = {
    'safety': 'workplace safety OSHA',
    'grievance': 'union grievance procedure',
    'contract': 'collective bargaining agreement',
    'benefits': 'union member benefits',
    'training': 'union training apprenticeship',
    'overtime': 'overtime compensation rules',
    'discipline': 'workplace discipline procedure',
    'steward': 'union steward representative'
  };
  
  const lowerContent = content.toLowerCase();
  
  for (const [keyword, context] of Object.entries(unionKeywords)) {
    if (lowerContent.includes(keyword)) {
      return `${context}: ${content}`;
    }
  }
  
  return content;
}

// Generate fallback responses for API errors
export function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('safety')) {
    return "I'm currently experiencing connectivity issues, but I can provide basic safety information: Always follow OSHA guidelines, report hazards immediately, use proper PPE, and contact your union steward for safety concerns. For detailed safety protocols, please try again later.";
  }
  
  if (lowerMessage.includes('grievance')) {
    return "I'm temporarily offline, but here's basic grievance guidance: Document the issue with dates and witnesses, contact your union steward within the contract timeframe, and follow the formal grievance procedure. Your steward can provide detailed assistance.";
  }
  
  if (lowerMessage.includes('benefits')) {
    return "I'm experiencing technical difficulties, but basic benefit information: Union members typically have healthcare, dental, vision, retirement plans, and paid time off. Contact your benefits administrator or union office for specific details about your coverage.";
  }
  
  return "I'm temporarily experiencing connectivity issues. For immediate assistance with union matters, please contact your union steward or the union office directly. I'll be back online shortly to provide detailed guidance.";
}

// Monitor and log token usage for optimization
export function logTokenUsage(usage: TokenUsage, conversationId: string): void {
  if (typeof window !== 'undefined') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      conversationId,
      usage,
      efficiency: usage.prompt / usage.total
    };
    
    console.log('Token Usage:', logEntry);
    
    // Store in localStorage for monitoring (optional)
    const existingLogs = JSON.parse(localStorage.getItem('tokenUsageLogs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only last 100 entries
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('tokenUsageLogs', JSON.stringify(existingLogs));
  }
}