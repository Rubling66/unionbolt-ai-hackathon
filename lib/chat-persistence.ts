// Chat persistence utilities for conversation history and message storage

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
  conversationId: string;
}

export interface StoredConversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  totalTokens: number;
  lastActivity: Date;
  created: Date;
}

// Local storage keys
const CONVERSATIONS_KEY = 'unionbolt_conversations';
const CURRENT_CONVERSATION_KEY = 'unionbolt_current_conversation';

// Get all stored conversations
export function getStoredConversations(): StoredConversation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    if (!stored) return [];
    
    const conversations = JSON.parse(stored);
    return conversations.map((conv: any) => ({
      ...conv,
      lastActivity: new Date(conv.lastActivity),
      created: new Date(conv.created),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

// Save conversation to storage
export function saveConversation(conversation: StoredConversation): void {
  if (typeof window === 'undefined') return;
  
  try {
    const conversations = getStoredConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    // Keep only last 50 conversations
    if (conversations.length > 50) {
      conversations.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      conversations.splice(50);
    }
    
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

// Get current conversation ID
export function getCurrentConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(CURRENT_CONVERSATION_KEY);
  } catch (error) {
    console.error('Failed to get current conversation ID:', error);
    return null;
  }
}

// Set current conversation ID
export function setCurrentConversationId(conversationId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CURRENT_CONVERSATION_KEY, conversationId);
  } catch (error) {
    console.error('Failed to set current conversation ID:', error);
  }
}

// Create new conversation
export function createNewConversation(): StoredConversation {
  const now = new Date();
  const conversation: StoredConversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: `Conversation ${now.toLocaleDateString()}`,
    messages: [],
    totalTokens: 0,
    lastActivity: now,
    created: now
  };
  
  saveConversation(conversation);
  setCurrentConversationId(conversation.id);
  
  return conversation;
}

// Add message to conversation
export function addMessageToConversation(
  conversationId: string,
  message: Omit<StoredMessage, 'conversationId'>
): void {
  const conversations = getStoredConversations();
  const conversation = conversations.find(c => c.id === conversationId);
  
  if (!conversation) {
    console.error('Conversation not found:', conversationId);
    return;
  }
  
  const storedMessage: StoredMessage = {
    ...message,
    conversationId
  };
  
  conversation.messages.push(storedMessage);
  conversation.lastActivity = new Date();
  conversation.totalTokens += message.tokens || 0;
  
  // Update title based on first user message
  if (conversation.messages.length === 1 && message.role === 'user') {
    conversation.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
  }
  
  saveConversation(conversation);
}

// Delete conversation
export function deleteConversation(conversationId: string): void {
  const conversations = getStoredConversations();
  const filteredConversations = conversations.filter(c => c.id !== conversationId);
  
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filteredConversations));
    
    // Clear current conversation if it was deleted
    if (getCurrentConversationId() === conversationId) {
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
}

// Clear all conversations
export function clearAllConversations(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CONVERSATIONS_KEY);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  } catch (error) {
    console.error('Failed to clear conversations:', error);
  }
}

// Export conversations as JSON
export function exportConversations(): string {
  const conversations = getStoredConversations();
  return JSON.stringify(conversations, null, 2);
}

// Import conversations from JSON
export function importConversations(jsonData: string): boolean {
  try {
    const conversations = JSON.parse(jsonData);
    
    // Validate structure
    if (!Array.isArray(conversations)) {
      throw new Error('Invalid format: expected array of conversations');
    }
    
    // Validate each conversation
    for (const conv of conversations) {
      if (!conv.id || !conv.messages || !Array.isArray(conv.messages)) {
        throw new Error('Invalid conversation format');
      }
    }
    
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    return true;
  } catch (error) {
    console.error('Failed to import conversations:', error);
    return false;
  }
}

// Get conversation statistics
export function getConversationStats(): {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  averageTokensPerMessage: number;
  oldestConversation?: Date;
  newestConversation?: Date;
} {
  const conversations = getStoredConversations();
  
  if (conversations.length === 0) {
    return {
      totalConversations: 0,
      totalMessages: 0,
      totalTokens: 0,
      averageTokensPerMessage: 0
    };
  }
  
  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
  const totalTokens = conversations.reduce((sum, conv) => sum + conv.totalTokens, 0);
  const dates = conversations.map(conv => conv.created).sort((a, b) => a.getTime() - b.getTime());
  
  return {
    totalConversations: conversations.length,
    totalMessages,
    totalTokens,
    averageTokensPerMessage: totalMessages > 0 ? Math.round(totalTokens / totalMessages) : 0,
    oldestConversation: dates[0],
    newestConversation: dates[dates.length - 1]
  };
}