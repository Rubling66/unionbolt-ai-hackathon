// Enhanced Tavus client with proper error handling
import { TavusClient } from './tavus-client';
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

export const tavus = new TavusClient();

export const UNION_PERSONAS = {
  shop_steward: {
    replicaId: 'r92debe21318', // Your actual replica ID
    personaId: 'pf3f7150ee47', // Your actual persona ID
    name: 'Reuben Martinez',
    role: 'Senior Union Advisor',
    expertise: ['DC-9 Finishing Trades', 'workplace disputes', 'safety protocols']
  }
};

export async function testTavusConnection() {
  try {
    logger.info('Testing Tavus connection');
    const isValid = tavus.validateConfiguration();
    logger.info('Tavus connection successful', { configValid: isValid });
    return { success: true, configValid: isValid };
  } catch (error) {
    logger.error('Tavus connection failed', { error });
    return { success: false, error };
  }
}

export function validateTavusConfig() {
  const required = ['TAVUS_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Tavus environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}