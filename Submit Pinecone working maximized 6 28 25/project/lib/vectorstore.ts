// Simplified vector store for Phase 1 reliability
import OpenAI from 'openai';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class UnionVectorStore {
  // Simplified OpenAI completion approach
  static async queryUnionKnowledge(question: string, context: string = '') {
    try {
      logger.info('Querying union knowledge', { questionLength: question.length });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are Reuben Martinez, a senior union advisor with 20+ years experience in DC-9 finishing trades. 
            
            Your expertise includes:
            - Workplace safety protocols and OSHA compliance
            - Grievance procedures and contract interpretation
            - Collective bargaining and worker rights
            - Construction industry labor relations
            
            Provide practical, experienced advice based on union principles and worker protection.`
          },
          {
            role: "user",
            content: `${context}\n\nQuestion: ${question}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      
      const answer = response.choices[0]?.message?.content || "I need more information to help you properly.";
      logger.info('Union knowledge query successful');
      return answer;
      
    } catch (error) {
      logger.error('OpenAI query failed', { error });
      return "I'm having trouble accessing my knowledge right now. Let me try to help based on my experience.";
    }
  }
  
  // Fallback knowledge base for offline scenarios
  static getBasicUnionGuidance(topic: string) {
    const guidance = {
      safety: `**Workplace Safety Priority:**
      • Always prioritize safety first - you have the right to refuse unsafe work
      • Report hazards immediately to your supervisor and union steward
      • OSHA protects your right to a safe workplace
      • Document all safety concerns with photos and witness statements
      • Contact union safety committee for persistent issues`,
      
      grievance: `**Grievance Process:**
      • Document everything - dates, times, witnesses, conversations
      • Follow the proper chain of command outlined in your contract
      • Contact your union steward within 24-48 hours of the incident
      • Keep copies of all documentation and correspondence
      • Know your contract rights and deadlines for filing`,
      
      wages: `**Wage and Hour Rights:**
      • Check your contract for current wage scales and classifications
      • Overtime is typically time-and-a-half after 8 hours daily or 40 weekly
      • You're entitled to all contractual benefits and pay rates
      • Report wage theft or misclassification to your steward immediately
      • Keep detailed records of hours worked and pay received`,
      
      contract: `**Contract Rights:**
      • Your collective bargaining agreement is legally binding
      • Both employer and union must follow contract terms
      • You have rights to representation in disciplinary meetings
      • Seniority systems protect job security and advancement
      • Contact your steward for contract interpretation questions`
    };
    
    return guidance[topic as keyof typeof guidance] || "Let me help you with that union question. Can you be more specific about what you need assistance with?";
  }
  
  // Health check for OpenAI connection
  static async testConnection() {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 5
      });
      return { success: true, model: "gpt-3.5-turbo" };
    } catch (error) {
      return { success: false, error };
    }
  }
}