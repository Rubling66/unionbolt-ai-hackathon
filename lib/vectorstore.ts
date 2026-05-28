// Union Vector Store – real vector search powered by Pinecone
// Embeds queries and searches the Pinecone index for document matches.

import { searchByText, embedText, verifyPineconeConnection } from './pinecone';

/**
 * UnionVectorStore provides document retrieval using Pinecone vector search.
 * Falls back to a basic guidance map when Pinecone is unavailable.
 */
export class UnionVectorStore {
  // Cache for connection state so we don't hammer the API
  private static pineconeAvailable: boolean | null = null;

  /**
   * Check whether Pinecone is reachable on startup.
   * Results are cached for the lifetime of the server.
   */
  static async isAvailable(): Promise<boolean> {
    if (this.pineconeAvailable !== null) return this.pineconeAvailable;
    try {
      const result = await verifyPineconeConnection();
      this.pineconeAvailable = result.connected;
      console.log('[UnionVectorStore] Pinecone available:', this.pineconeAvailable);
      return this.pineconeAvailable;
    } catch {
      this.pineconeAvailable = false;
      return false;
    }
  }

  /**
   * Query the Pinecone index by embedding the question and returning
   * the top-K matching documents.
   *
   * @param question – user's query text
   * @param context  – optional additional context string (appended to query)
   * @param topK     – number of results to return (default 5)
   */
  static async queryUnionKnowledge(
    question: string,
    context: string = '',
    topK: number = 5
  ): Promise<string> {
    const available = await this.isAvailable();

    if (!available) {
      console.log('[UnionVectorStore] Pinecone unavailable, using fallback guidance');
      const topic = this.detectTopic(question);
      return this.getBasicUnionGuidance(topic);
    }

    try {
      const query = context ? `${question}\n\n${context}` : question;
      const results = await searchByText(query, topK);

      if (results.matches.length === 0) {
        console.log('[UnionVectorStore] No results found, using fallback');
        const topic = this.detectTopic(question);
        return this.getBasicUnionGuidance(topic);
      }

      // Format results as a readable string
      const docs = results.matches
        .filter((m) => m.metadata?.text)
        .map(
          (m, i) =>
            `**Document ${i + 1}** (relevance: ${(m.score * 100).toFixed(0)}%)\n${m.metadata!.text}`
        )
        .join('\n\n---\n\n');

      return docs;
    } catch (error) {
      console.error('[UnionVectorStore] Vector search failed:', error);
      const topic = this.detectTopic(question);
      return this.getBasicUnionGuidance(topic);
    }
  }

  // ── Topic detection ────────────────────────────────────────────────────

  private static detectTopic(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('safety') || q.includes('osha') || q.includes('hazard')) return 'safety';
    if (q.includes('grievance') || q.includes('complaint') || q.includes('dispute')) return 'grievance';
    if (q.includes('wage') || q.includes('overtime') || q.includes('pay')) return 'wages';
    if (q.includes('contract') || q.includes('agreement') || q.includes('cba')) return 'contract';
    if (q.includes('benefit') || q.includes('health') || q.includes('insurance')) return 'benefits';
    if (q.includes('training') || q.includes('apprentice') || q.includes('education')) return 'training';
    return 'general';
  }

  // ── Fallback knowledge base ────────────────────────────────────────────

  static getBasicUnionGuidance(topic: string): string {
    const guidance: Record<string, string> = {
      safety: `**Workplace Safety Priority:**
• Always prioritize safety — you have the right to refuse unsafe work
• Report hazards immediately to your supervisor and union steward
• OSHA protects your right to a safe workplace
• Document all safety concerns with photos and witness statements
• Contact union safety committee for persistent issues`,

      grievance: `**Grievance Process:**
• Document everything — dates, times, witnesses, conversations
• Follow the proper chain of command outlined in your contract
• Contact your union steward within 24-48 hours of the incident
• Keep copies of all documentation and correspondence
• Know your contract rights and deadlines for filing`,

      wages: `**Wage and Hour Rights:**
• Check your contract for current wage scales and classifications
• Overtime is typically time-and-a-half after 8 hours daily or 40 weekly
• You are entitled to all contractual benefits and pay rates
• Report wage theft or misclassification to your steward immediately
• Keep detailed records of hours worked and pay received`,

      contract: `**Contract Rights:**
• Your collective bargaining agreement is legally binding
• Both employer and union must follow contract terms
• You have rights to representation in disciplinary meetings
• Seniority systems protect job security and advancement
• Contact your steward for contract interpretation questions`,

      benefits: `**Union Benefits Overview:**
• Healthcare coverage with comprehensive medical, dental, and vision
• Pension and 401(k) retirement plans with employer contributions
• Paid time off including vacation, sick leave, and personal days
• Life insurance and disability coverage
• Contact your benefits administrator for specific enrollment details`,

      training: `**Training & Development:**
• Apprenticeship programs combining classroom and on-the-job training
• Continuing education and skills upgrade workshops
• Safety certification courses (OSHA 10, OSHA 30)
• Tuition reimbursement for job-related education
• Contact the Training Coordinator for application information`,

      general: `**Union Member Support:**
I can help with questions about:
• **Safety & Health** — OSHA compliance, workplace hazards, PPE
• **Grievances** — Filing complaints, discipline, contract violations
• **Benefits** — Healthcare, retirement, vacation, insurance
• **Contracts** — Wages, overtime, working conditions, job security
• **Training** — Apprenticeships, certifications, skill development

Please ask a specific question so I can provide the most relevant information.`,
    };

    return guidance[topic] || guidance.general;
  }

  // ── Connection test ────────────────────────────────────────────────────

  static async testConnection(): Promise<{ success: boolean; error?: any }> {
    try {
      const available = await this.isAvailable();
      if (available) {
        return { success: true };
      }
      // Pinecone not available but that's not necessarily an error — fallback works
      return { success: true, error: 'Pinecone unavailable, using fallback knowledge base' };
    } catch (error) {
      return { success: false, error };
    }
  }
}
