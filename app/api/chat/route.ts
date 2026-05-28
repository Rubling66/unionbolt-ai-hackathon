import { NextRequest, NextResponse } from 'next/server';
import { databaseManager } from '@/lib/database-manager';
import { searchByText } from '@/lib/pinecone';

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

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

function logChatAPI(context: string, data: any) {
  console.log(`[Chat API] ${context}:`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  logChatAPI('Starting chat request', {
    nodeEnv: process.env.NODE_ENV,
    useRealAI: process.env.NEXT_PUBLIC_USE_REAL_AI === 'true',
  });

  try {
    // ── Parse body ──────────────────────────────────────────────────────
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

    // ── Validate ────────────────────────────────────────────────────────
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      logChatAPI('Invalid messages array', { messages, conversationId });
      return NextResponse.json(
        { error: 'Messages array is required and cannot be empty' },
        { status: 400 }
      );
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        logChatAPI('Invalid message structure', { messageIndex: i, message: msg });
        return NextResponse.json(
          { error: `Invalid message structure at index ${i}` },
          { status: 400 }
        );
      }
    }

    // ── Limit context window ────────────────────────────────────────────
    const limitedMessages = messages.slice(-10);
    logChatAPI('Processing messages', {
      originalCount: messages.length,
      limitedCount: limitedMessages.length,
      conversationId,
    });

    const userMessage = limitedMessages[limitedMessages.length - 1];
    const previousMessages = limitedMessages.slice(0, -1);

    // ── RAG pipeline ────────────────────────────────────────────────────
    let ragContext = '';
    try {
      const searchResults = await searchByText(userMessage.content, 5);
      if (searchResults.matches.length > 0) {
        ragContext = searchResults.matches
          .filter(m => m.metadata?.text)
          .map((m, i) => `[Document ${i + 1}] (relevance: ${(m.score * 100).toFixed(0)}%)\n${m.metadata!.text}`)
          .join('\n\n');
        logChatAPI('RAG context found', { matchCount: searchResults.matches.length });
      }
    } catch (searchError) {
      logChatAPI('Pinecone search failed (non-fatal)', {
        error: searchError instanceof Error ? searchError.message : 'Unknown error',
      });
    }

    // ── Build DeepSeek request ──────────────────────────────────────────
    const systemPrompt = `You are an expert union advisor and workplace advocate. Your role is to help union members with questions about workplace safety, grievance procedures, contracts, benefits, training, and workers' rights.

You provide accurate, practical, and empathetic advice based on labor law, collective bargaining practices, and union principles. When you have relevant document context, use it to ground your answers.

Keep responses clear, structured, and actionable. Use markdown formatting for readability.`;

    const deepseekMessages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (user ↔ assistant)
    for (const msg of previousMessages) {
      deepseekMessages.push({ role: msg.role, content: msg.content });
    }

    // Build the final user message with RAG context
    let finalUserContent = userMessage.content;
    if (ragContext) {
      finalUserContent = `Here are relevant documents from our knowledge base:\n\n${ragContext}\n\nBased on the above, please answer the following question:\n\n${userMessage.content}`;
    }

    deepseekMessages.push({ role: 'user', content: finalUserContent });

    // ── Call DeepSeek API ───────────────────────────────────────────────
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      logChatAPI('DEEPSEEK_API_KEY not set');
      return NextResponse.json({
        status: 'error',
        error: 'DeepSeek API key not configured',
        message: "I'm sorry, the AI system is not fully configured yet. Please ensure DEEPSEEK_API_KEY is set in your environment variables.",
        conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        assistant: 'unionbolt-ai-agent',
      }, { status: 200 }); // 200 so the UI can display the message gracefully
    }

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: deepseekMessages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logChatAPI('DeepSeek API error', { status: response.status, body: errorBody });
      return NextResponse.json({
        status: 'error',
        error: `DeepSeek API returned ${response.status}`,
        message: "I'm sorry, the AI service is temporarily unavailable. Please try again shortly.",
        conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        assistant: 'unionbolt-ai-agent',
      }, { status: 200 });
    }

    const data = await response.json();
    const completionContent = data.choices?.[0]?.message?.content || '';

    if (!completionContent) {
      logChatAPI('DeepSeek returned empty response');
      return NextResponse.json({
        status: 'error',
        error: 'Empty response from AI',
        message: "I'm sorry, I received an empty response. Please try rephrasing your question.",
        conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        assistant: 'unionbolt-ai-agent',
      }, { status: 200 });
    }

    const usage = data.usage || {};
    const tokenUsage: TokenUsage = {
      prompt: usage.prompt_tokens || 0,
      completion: usage.completion_tokens || 0,
      total: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
    };

    const responseConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logChatAPI('Response generated successfully', {
      conversationId: responseConversationId,
      tokenUsage,
      responseLength: completionContent.length,
    });

    return NextResponse.json({
      message: completionContent,
      tokenUsage,
      conversationId: responseConversationId,
      timestamp: new Date().toISOString(),
      messagesInContext: limitedMessages.length,
      assistant: 'unionbolt-ai-agent',
      status: 'success',
    });
  } catch (error) {
    logChatAPI('Unhandled API error', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      url: request.url,
      method: request.method,
    });

    return NextResponse.json({
      status: 'error',
      error: 'Internal server error',
      message: "I'm experiencing technical difficulties. For immediate union assistance, please contact your steward or union office directly.",
      timestamp: new Date().toISOString(),
      assistant: 'unionbolt-ai-agent',
    }, { status: 500 });
  }
}
