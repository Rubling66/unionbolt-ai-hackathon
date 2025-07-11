import { NextRequest, NextResponse } from 'next/server';
import { tavusClient } from '@/lib/tavus-client';

export async function POST(request: NextRequest) {
  try {
    // Validate Tavus client configuration
    if (!tavusClient.validateConfiguration()) {
      console.error('Tavus client configuration invalid');
      return NextResponse.json(
        {
          error: 'Tavus configuration is incomplete. Please check environment variables.',
          code: 'CONFIGURATION_ERROR',
        },
        { status: 500 }
      );
    }

    // Parse request body for any custom options
    let options = {};
    try {
      const body = await request.json();
      options = body.options || {};
    } catch (error) {
      // If no body or invalid JSON, use default options
      console.log('Using default conversation options');
    }

    // Create conversation with Tavus
    console.log('Creating Tavus conversation with UnionBolt Job Steward...');
    const conversation = await tavusClient.createConversation(options);

    // Log successful creation
    console.log('Tavus conversation created successfully:', {
      conversationId: conversation.conversation_id,
      status: conversation.status,
      persona: tavusClient.getPersonaInfo(),
    });

    // Return conversation details
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.conversation_id,
        url: conversation.conversation_url,
        status: conversation.status,
      },
      persona: tavusClient.getPersonaInfo(),
      message: 'Conversation created successfully with UnionBolt Job Steward Support Specialist',
    });
  } catch (error) {
    console.error('Failed to create Tavus conversation:', error);

    // Determine error type and status code
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific Tavus API errors
      if (error.message.includes('Tavus API Error')) {
        statusCode = 400;
        errorCode = 'TAVUS_API_ERROR';
      } else if (error.message.includes('environment variable')) {
        statusCode = 500;
        errorCode = 'CONFIGURATION_ERROR';
      } else if (error.message.includes('fetch')) {
        statusCode = 503;
        errorCode = 'NETWORK_ERROR';
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code: errorCode,
        success: false,
      },
      { status: statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return Tavus client status and configuration info
    const isConfigured = tavusClient.validateConfiguration();
    const personaInfo = tavusClient.getPersonaInfo();

    return NextResponse.json({
      success: true,
      configured: isConfigured,
      persona: personaInfo,
      endpoints: {
        create: '/api/tavus/conversation',
        status: '/api/tavus/conversation/[id]',
      },
      message: isConfigured
        ? 'Tavus client is properly configured'
        : 'Tavus client configuration is incomplete',
    });
  } catch (error) {
    console.error('Failed to get Tavus status:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve Tavus status',
        code: 'STATUS_ERROR',
        success: false,
      },
      { status: 500 }
    );
  }
}