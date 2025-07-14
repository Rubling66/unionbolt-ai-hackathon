import { NextRequest, NextResponse } from 'next/server';
import { tavus, UNION_PERSONAS } from '@/lib/tavus';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

export async function POST(request: NextRequest) {
  try {
    const { replicaId, personaId } = await request.json();
    
    // Validate input
    if (!replicaId || !personaId) {
      return NextResponse.json(
        { error: 'Missing replicaId or personaId' }, 
        { status: 400 }
      );
    }
    
    logger.info('Creating Tavus conversation', { replicaId, personaId });
    
    const conversation = await tavus.conversations.create({
      replica_id: replicaId,
      persona_id: personaId,
      properties: {
        max_call_duration: 1800, // 30 minutes
        participant_left_timeout: 60,
        participant_absent_timeout: 300
      }
    });
    
    logger.info('Tavus conversation created successfully', {
      conversationId: conversation.conversation_id
    });
    
    return NextResponse.json({
      conversationUrl: conversation.conversation_url,
      conversationId: conversation.conversation_id,
      status: 'success'
    });
    
  } catch (error) {
    logger.error('Failed to create Tavus conversation', { error });
    
    return NextResponse.json(
      { 
        error: 'Failed to create conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const replicas = await tavus.replicas.list();
    return NextResponse.json({
      status: 'healthy',
      replicaCount: replicas.length,
      availablePersonas: Object.keys(UNION_PERSONAS)
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}