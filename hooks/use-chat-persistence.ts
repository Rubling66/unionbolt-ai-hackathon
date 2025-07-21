import { useState, useEffect } from 'react';
import {
  StoredConversation,
  StoredMessage,
  getStoredConversations,
  getCurrentConversationId,
  createNewConversation,
  addMessageToConversation,
  deleteConversation,
  setCurrentConversationId
} from '@/lib/chat-persistence';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

export function useChatPersistence() {
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [currentConversationId, setCurrentConversationIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);

  // Load conversations and current conversation on mount
  useEffect(() => {
    const loadedConversations = getStoredConversations();
    setConversations(loadedConversations);
    
    const currentId = getCurrentConversationId();
    if (currentId) {
      const currentConv = loadedConversations.find(c => c.id === currentId);
      if (currentConv) {
        setCurrentConversationIdState(currentId);
        setMessages(currentConv.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          tokens: msg.tokens
        })));
        setTotalTokens(currentConv.totalTokens);
      }
    }
  }, []);

  // Start new conversation
  const startNewConversation = () => {
    const newConv = createNewConversation();
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationIdState(newConv.id);
    setMessages([]);
    setTotalTokens(0);
    return newConv.id;
  };

  // Switch to existing conversation
  const switchToConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return false;
    
    setCurrentConversationIdState(conversationId);
    setCurrentConversationId(conversationId);
    setMessages(conversation.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      tokens: msg.tokens
    })));
    setTotalTokens(conversation.totalTokens);
    return true;
  };

  // Add message to current conversation
  const addMessage = (message: Omit<Message, 'id'>) => {
    if (!currentConversationId) {
      // Create new conversation if none exists
      const newConvId = startNewConversation();
      const messageWithId = {
        ...message,
        id: Date.now().toString()
      };
      
      addMessageToConversation(newConvId, messageWithId);
      setMessages([messageWithId]);
      setTotalTokens(message.tokens || 0);
      
      // Reload conversations to get updated data
      setConversations(getStoredConversations());
      return messageWithId;
    }
    
    const messageWithId = {
      ...message,
      id: Date.now().toString()
    };
    
    addMessageToConversation(currentConversationId, messageWithId);
    setMessages(prev => [...prev, messageWithId]);
    setTotalTokens(prev => prev + (message.tokens || 0));
    
    // Reload conversations to get updated data
    setConversations(getStoredConversations());
    return messageWithId;
  };

  // Delete conversation
  const removeConversation = (conversationId: string) => {
    deleteConversation(conversationId);
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    
    if (currentConversationId === conversationId) {
      setCurrentConversationIdState(null);
      setMessages([]);
      setTotalTokens(0);
    }
  };

  // Clear current conversation
  const clearCurrentConversation = () => {
    if (currentConversationId) {
      removeConversation(currentConversationId);
    }
  };

  return {
    conversations,
    currentConversationId,
    messages,
    totalTokens,
    startNewConversation,
    switchToConversation,
    addMessage,
    removeConversation,
    clearCurrentConversation
  };
}