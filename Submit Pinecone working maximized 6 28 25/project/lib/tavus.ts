// Enhanced Tavus client with proper error handling
import { TavusClient } from '@tavus/client-sdk';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'tavus.log' })
  ]
});

export const tavus = new TavusClient({
  apiKey: process.env.TAVUS_API_KEY!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
});

// SIMPLIFIED: Single working persona for Phase 1
export const UNION_PERSONAS = {
  shop_steward: {
    replicaId: 'r92debe21318', // Your actual replica ID
    personaId: 'pf3f7150ee47', // Your actual persona ID
    name: 'Reuben Martinez',
    role: 'Senior Union Advisor',
    expertise: ['DC-9 Finishing Trades', 'workplace disputes', 'safety protocols']
  }
};

// Connection testing function
export async function testTavusConnection() {
  try {
    logger.info('Testing Tavus connection');
    const replicas = await tavus.replicas.list();
    logger.info('Tavus connection successful', { replicaCount: replicas.length });
    return { success: true, replicas };
  } catch (error) {
    logger.error('Tavus connection failed', { error });
    return { success: false, error };
  }
}

// Validate environment variables
export function validateTavusConfig() {
  const required = ['TAVUS_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Tavus environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}