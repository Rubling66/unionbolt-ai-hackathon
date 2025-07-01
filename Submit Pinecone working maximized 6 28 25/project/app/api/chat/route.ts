import { NextRequest, NextResponse } from 'next/server';
import { pineconeManager } from '@/lib/pinecone-enhanced';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  conversationId?: string;
}

interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

// Enhanced logging function
function logChatAPI(context: string, data: any) {
  console.log(`[Chat API] ${context}:`, {
    ...data,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  logChatAPI('Starting chat request', {
    nodeEnv: process.env.NODE_ENV,
    hasApiKey: !!process.env.PINECONE_API_KEY,
    hasAssistantId: !!process.env.PINECONE_ASSISTANT_ID
  });
  
  try {
    // Parse request body
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      logChatAPI('Request body parsing failed', { error: parseError });
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { messages, conversationId } = body;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      logChatAPI('Invalid messages array', { messages, conversationId });
      return NextResponse.json(
        { error: 'Messages array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate message structure
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (!message.role || !message.content || typeof message.content !== 'string') {
        logChatAPI('Invalid message structure', { messageIndex: i, message });
        return NextResponse.json(
          { error: `Invalid message structure at index ${i}` },
          { status: 400 }
        );
      }
    }

    // Limit conversation history to last 5 messages for efficiency
    const limitedMessages = messages.slice(-5);
    logChatAPI('Processing messages', {
      originalCount: messages.length,
      limitedCount: limitedMessages.length,
      conversationId
    });

    // Get the user's latest message
    const userMessage = limitedMessages[limitedMessages.length - 1];
    const context = limitedMessages.slice(0, -1).map(msg => msg.content);

    // Generate AI response using Pinecone
    let aiResponse;
    try {
      // Check Pinecone connection status
      const status = pineconeManager.getStatus();
      
      if (status.connected) {
        // Use Pinecone for enhanced responses
        aiResponse = await pineconeManager.queryAssistant(userMessage.content, context);
        
        logChatAPI('Pinecone response generated successfully', {
          tokenUsage: aiResponse.tokenUsage,
          responseLength: aiResponse.response.length
        });
      } else {
        // Fallback to local knowledge base
        throw new Error('Pinecone connection not available');
      }
    } catch (responseError) {
      logChatAPI('AI response generation failed, using fallback', { error: responseError });
      
      // Use fallback response
      const fallbackMessage = getFallbackResponse(userMessage.content);
      aiResponse = {
        response: fallbackMessage,
        tokenUsage: {
          prompt: Math.ceil(userMessage.content.length / 4),
          completion: Math.ceil(fallbackMessage.length / 4),
          total: Math.ceil((userMessage.content.length + fallbackMessage.length) / 4)
        }
      };
    }

    // Generate or use existing conversation ID
    const responseConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare successful response
    const responseData = {
      message: aiResponse.response,
      tokenUsage: aiResponse.tokenUsage,
      conversationId: responseConversationId,
      timestamp: new Date().toISOString(),
      messagesInContext: limitedMessages.length,
      assistant: 'business-agent-bot',
      status: 'success'
    };

    logChatAPI('Sending successful response', {
      conversationId: responseConversationId,
      tokenUsage: aiResponse.tokenUsage
    });

    return NextResponse.json(responseData);

  } catch (error) {
    // Comprehensive error logging
    logChatAPI('Unhandled API error', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      url: request.url,
      method: request.method
    });
    
    // Determine appropriate error response
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid JSON format';
      statusCode = 400;
    } else if (error instanceof TypeError) {
      errorMessage = 'Invalid request format';
      statusCode = 400;
    }
    
    // Return error response with fallback message
    return NextResponse.json({
      status: 'error',
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      fallbackMessage: "I'm experiencing technical difficulties. For immediate union assistance, please contact your steward or union office directly.",
      timestamp: new Date().toISOString(),
      assistant: 'business-agent-bot'
    }, { status: statusCode });
  }
}

// Enhanced fallback response function
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('safety') || lowerMessage.includes('osha') || lowerMessage.includes('hazard')) {
    return "I'm currently experiencing connectivity issues, but here's essential safety information: Always follow OSHA regulations, report hazards immediately to your supervisor and union steward, use proper PPE, and never perform unsafe work. For detailed safety protocols, contact your union safety representative or try again shortly.";
  }
  
  if (lowerMessage.includes('grievance') || lowerMessage.includes('complaint') || lowerMessage.includes('dispute')) {
    return "I'm temporarily offline, but here's basic grievance guidance: Document the issue with dates and witnesses, contact your union steward within the contract timeframe, and follow the formal grievance procedure outlined in your collective bargaining agreement. Your steward can provide immediate assistance.";
  }
  
  if (lowerMessage.includes('benefits') || lowerMessage.includes('healthcare') || lowerMessage.includes('insurance')) {
    return "I'm experiencing technical difficulties, but basic benefit information: Union members typically have comprehensive healthcare, dental, vision, retirement plans, and paid time off. Contact your benefits administrator or union office for specific details about your coverage and enrollment.";
  }
  
  if (lowerMessage.includes('contract') || lowerMessage.includes('wages') || lowerMessage.includes('overtime')) {
    return "I'm currently offline, but here's basic contract information: Your collective bargaining agreement covers wages, overtime pay, working conditions, and job security. Contact your union steward for specific contract questions or to request a copy of your current agreement.";
  }
  
  return "I'm temporarily experiencing connectivity issues with the knowledge base. For immediate assistance with union matters, please contact your union steward or the union office directly. I'll be back online shortly to provide detailed guidance on safety, grievances, benefits, contracts, and training.";
}