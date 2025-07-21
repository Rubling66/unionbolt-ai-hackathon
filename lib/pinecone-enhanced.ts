import { Pinecone } from '@pinecone-database/pinecone';

// Enhanced Pinecone client with comprehensive error handling and logging
class PineconeManager {
  private client: Pinecone | null = null;
  private isInitialized = false;
  private connectionStatus = {
    connected: false,
    lastChecked: null as Date | null,
    error: null as string | null,
    assistantId: 'business-agent-bot'
  };

  constructor() {
    this.initialize();
  }

  private log(context: string, data: any) {
    console.log(`[PineconeManager] ${context}:`, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  private async initialize() {
    try {
      if (!process.env.PINECONE_API_KEY) {
        throw new Error('PINECONE_API_KEY environment variable is required');
      }

      if (!process.env.PINECONE_API_KEY.startsWith('pcsk_')) {
        throw new Error('Invalid PINECONE_API_KEY format. Must start with "pcsk_"');
      }

      this.client = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

      this.connectionStatus.assistantId = process.env.PINECONE_ASSISTANT_ID || 'business-agent-bot';
      this.isInitialized = true;

      this.log('Initialized successfully', {
        assistantId: this.connectionStatus.assistantId,
        apiKeyPrefix: process.env.PINECONE_API_KEY.substring(0, 8) + '...'
      });

      // Test connection immediately
      await this.testConnection();
    } catch (error) {
      this.log('Initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.connectionStatus.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  async testConnection(): Promise<{
    connected: boolean;
    assistantId: string;
    error?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      if (!this.client) {
        throw new Error('Pinecone client not initialized');
      }

      // Test connection by listing indexes
      const indexes = await this.client.listIndexes();
      const responseTime = Date.now() - startTime;

      this.connectionStatus = {
        connected: true,
        lastChecked: new Date(),
        error: null,
        assistantId: this.connectionStatus.assistantId
      };

      this.log('Connection test successful', {
        responseTime,
        indexCount: indexes.indexes?.length || 0
      });

      return {
        connected: true,
        assistantId: this.connectionStatus.assistantId,
        responseTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.connectionStatus = {
        connected: false,
        lastChecked: new Date(),
        error: errorMessage,
        assistantId: this.connectionStatus.assistantId
      };

      this.log('Connection test failed', { error: errorMessage });

      return {
        connected: false,
        assistantId: this.connectionStatus.assistantId,
        error: errorMessage
      };
    }
  }

  async queryAssistant(query: string, context: string[] = []): Promise<{
    response: string;
    tokenUsage: {
      prompt: number;
      completion: number;
      total: number;
    };
  }> {
    try {
      if (!this.connectionStatus.connected) {
        throw new Error('Pinecone connection not available');
      }

      // Simulate AI response with union-specific knowledge
      const response = await this.generateUnionResponse(query, context);
      
      // Calculate token usage
      const promptTokens = Math.ceil((query + context.join(' ')).length / 4);
      const completionTokens = Math.ceil(response.length / 4);
      
      return {
        response,
        tokenUsage: {
          prompt: promptTokens,
          completion: completionTokens,
          total: promptTokens + completionTokens
        }
      };
    } catch (error) {
      this.log('Query failed', { error, query: query.substring(0, 100) });
      throw error;
    }
  }

  private async generateUnionResponse(query: string, context: string[]): Promise<string> {
    const lowerQuery = query.toLowerCase();
    
    // Union knowledge base responses
    if (lowerQuery.includes('safety') || lowerQuery.includes('osha') || lowerQuery.includes('hazard')) {
      return `**Workplace Safety Guidelines:**

• **OSHA Compliance**: All workplaces must follow OSHA safety standards and regulations
• **Right to Safe Workplace**: You have the legal right to a safe work environment free from recognized hazards
• **PPE Requirements**: Employers must provide necessary protective equipment at no cost to workers
• **Hazard Reporting**: Report unsafe conditions immediately to your supervisor and union steward
• **Safety Training**: Mandatory safety training must be provided for all job functions and equipment
• **Accident Reporting**: All workplace injuries must be reported within 24 hours to management and union
• **Safety Committees**: Union members participate in joint labor-management safety committees
• **Refusal Rights**: You can refuse unsafe work without retaliation under OSHA Section 11(c)

**Emergency Contacts:**
- Union Safety Representative: Available 24/7 for safety concerns
- OSHA Hotline: 1-800-321-OSHA (6742)
- Emergency Services: 911

**Next Steps:** Contact your union steward immediately for any safety concerns or to file a safety complaint.`;
    }

    if (lowerQuery.includes('grievance') || lowerQuery.includes('complaint') || lowerQuery.includes('dispute')) {
      return `**Union Grievance Procedure:**

**Step 1: Informal Resolution (5 business days)**
• Discuss the issue with your immediate supervisor
• Document the conversation with date, time, and witnesses present
• Union steward may assist in informal discussion

**Step 2: Formal Written Grievance (10 business days)**
• File written grievance with union steward assistance
• Include specific contract violations and requested remedy
• Management has 10 business days to respond in writing

**Step 3: Union-Management Meeting (15 business days)**
• Union representatives meet with higher management
• Present evidence and witness statements
• Seek resolution through negotiation

**Step 4: Arbitration (if needed)**
• Independent arbitrator makes binding decision
• Union covers arbitration costs for valid grievances
• Final and binding resolution

**Important Rights:**
- Right to union representation at all disciplinary meetings
- Protection against retaliation for filing grievances
- Right to have steward present during investigations
- Access to relevant documents and information

**Time Limits:** Grievances must be filed within the timeframes specified in your contract. Contact your union steward immediately as time limits are strict and cannot be extended.`;
    }

    if (lowerQuery.includes('benefits') || lowerQuery.includes('healthcare') || lowerQuery.includes('insurance')) {
      return `**Comprehensive Union Benefits Package:**

**Healthcare Coverage:**
• Medical insurance with comprehensive coverage for members and families
• Dental insurance including preventive, basic, and major services
• Vision insurance covering exams, glasses, and contact lenses
• Prescription drug coverage with low co-pays
• Mental health and substance abuse coverage

**Retirement Benefits:**
• Defined benefit pension plan with guaranteed monthly payments
• 401(k) plan with employer matching contributions
• Vesting schedule based on years of service
• Early retirement options for qualified members

**Paid Time Off:**
• Vacation time that increases with seniority
• Sick leave accrual for personal and family illness
• Personal days for individual needs
• Bereavement leave for family members
• Jury duty pay and civic leave

**Additional Benefits:**
• Life insurance coverage for members and dependents
• Short-term and long-term disability insurance
• Workers' compensation coverage
• Tuition reimbursement programs for job-related education
• Union-sponsored training and apprenticeship programs

**Enrollment Information:**
Contact the Benefits Administrator at your union office for enrollment details, coverage questions, and claims assistance. Open enrollment typically occurs annually in November.`;
    }

    if (lowerQuery.includes('contract') || lowerQuery.includes('wages') || lowerQuery.includes('overtime')) {
      return `**Collective Bargaining Agreement Overview:**

**Wage Structure:**
• Annual wage increases based on contract negotiations
• Step increases for experience and longevity
• Overtime pay at time-and-a-half after 8 hours/day or 40 hours/week
• Double time for work on scheduled days off and holidays
• Shift differentials for evening, night, and weekend work

**Working Conditions:**
• Maximum hours and mandatory rest periods between shifts
• Break and meal period requirements
• Scheduling and shift assignment procedures
• Job classification and promotion criteria
• Workplace safety and health standards

**Job Security:**
• Seniority system for layoffs and recalls
• Just cause protection for discipline and termination
• Bumping rights during workforce reductions
• Recall rights for laid-off employees
• Protection against discrimination and harassment

**Contract Enforcement:**
• Union stewards monitor compliance with contract terms
• Grievance procedure for contract violations
• Regular labor-management meetings
• Contract interpretation guidelines and precedents

**Current Contract Information:**
For specific contract language, wage scales, and detailed provisions, contact your union steward or request a copy from the union office. The current contract is effective through [contract expiration date].`;
    }

    if (lowerQuery.includes('training') || lowerQuery.includes('apprentice') || lowerQuery.includes('education')) {
      return `**Union Training and Development Programs:**

**Apprenticeship Programs:**
• 4-year comprehensive training combining classroom and on-the-job experience
• Competitive wages that increase with progression through the program
• Guaranteed employment upon successful completion
• Industry-recognized certifications and credentials
• Mentorship from experienced journeymen

**Continuing Education:**
• Skills upgrade workshops and seminars
• Safety certification courses (OSHA 10, OSHA 30, specialized safety training)
• Technology training programs for new equipment and methods
• Leadership development courses for union activists
• Specialized trade certifications and licenses

**Tuition Assistance:**
• Reimbursement for job-related education and training
• Partnerships with local colleges and trade schools
• Online learning opportunities and distance education
• Professional development seminars and conferences
• Career counseling and guidance services

**Training Benefits:**
• Paid training time during work hours when possible
• Travel and accommodation allowances for training locations
• Training materials and equipment provided
• Career advancement opportunities upon completion
• Higher wage classifications for additional skills

**How to Apply:**
Contact the Training Coordinator at your union office for application information. Training programs typically accept applications twice yearly, and prerequisites vary by program.`;
    }

    // Default response for general queries
    return `**Union Member Services and Support:**

I'm here to help with union-related questions and provide information about:

• **Safety & Health**: OSHA compliance, workplace hazards, safety training, and protective equipment
• **Grievances**: Filing complaints, disciplinary procedures, contract violations, and dispute resolution
• **Benefits**: Healthcare, retirement, vacation, sick leave, and insurance coverage
• **Contracts**: Wages, overtime, working conditions, job security, and collective bargaining
• **Training**: Apprenticeships, certifications, skill development, and educational opportunities
• **Representation**: Steward services, legal assistance, and workplace advocacy

**Common Questions:**
- "How do I file a grievance against my supervisor?"
- "What safety equipment is required for my specific job?"
- "How does overtime pay work under our contract?"
- "What benefits am I entitled to as a union member?"
- "How do I contact my union steward for assistance?"
- "What training programs are available to advance my career?"

**Emergency Contacts:**
- Union Office Main Line: [Phone number]
- After-hours Emergency Line: [Emergency number]
- Safety Hotline: Available 24/7 for urgent safety concerns

**Next Steps:** Please feel free to ask specific questions about any union-related topic. I can provide detailed information about your rights, benefits, and available resources.

What specific union topic would you like to know more about today?`;
  }

  getStatus() {
    return { ...this.connectionStatus };
  }

  async healthCheck() {
    const connectionResult = await this.testConnection();
    return {
      status: connectionResult.connected ? 'healthy' : 'unhealthy',
      details: connectionResult,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const pineconeManager = new PineconeManager();
export default pineconeManager;