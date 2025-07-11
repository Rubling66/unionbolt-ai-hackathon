import DailyIframe from '@daily-co/daily-js';

interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

interface TavusConversationRequest {
  replica_id: string;
  persona_id: string;
  callback_url?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    enable_transcription?: boolean;
  };
}

interface TavusErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

export class TavusClient {
  private apiKey: string;
  private baseUrl: string;
  private personaId: string;
  private replicaId: string;

  constructor() {
    this.apiKey = process.env.TAVUS_API_KEY || '';
    this.baseUrl = process.env.TAVUS_BASE_URL || 'https://tavusapi.com/v2';
    this.personaId = process.env.TAVUS_PERSONA_ID || '';
    this.replicaId = process.env.TAVUS_REPLICA_ID || '';

    if (!this.apiKey) {
      throw new Error('TAVUS_API_KEY environment variable is required');
    }
    if (!this.personaId) {
      throw new Error('TAVUS_PERSONA_ID environment variable is required');
    }
    if (!this.replicaId) {
      throw new Error('TAVUS_REPLICA_ID environment variable is required');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData: TavusErrorResponse = await response.json().catch(() => ({
        error: {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: 'HTTP_ERROR',
        },
      }));
      
      throw new Error(
        `Tavus API Error: ${errorData.error.message} (Code: ${errorData.error.code})`
      );
    }

    return response.json();
  }

  async createConversation(
    options: Partial<TavusConversationRequest> = {}
  ): Promise<TavusConversationResponse> {
    const requestBody: TavusConversationRequest = {
      replica_id: this.replicaId,
      persona_id: this.personaId,
      properties: {
        max_call_duration: 1800, // 30 minutes
        participant_left_timeout: 60,
        participant_absent_timeout: 300,
        enable_recording: false,
        enable_transcription: true,
        ...options.properties,
      },
      ...options,
    };

    try {
      const response = await this.makeRequest<TavusConversationResponse>(
        '/conversations',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      console.log('Tavus conversation created:', {
        id: response.conversation_id,
        status: response.status,
      });

      return response;
    } catch (error) {
      console.error('Failed to create Tavus conversation:', error);
      throw error;
    }
  }

  async getConversationStatus(conversationId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/conversations/${conversationId}`);
      return response;
    } catch (error) {
      console.error('Failed to get conversation status:', error);
      throw error;
    }
  }

  async endConversation(conversationId: string): Promise<any> {
    try {
      const response = await this.makeRequest(
        `/conversations/${conversationId}/end`,
        {
          method: 'POST',
        }
      );
      
      console.log('Tavus conversation ended:', conversationId);
      return response;
    } catch (error) {
      console.error('Failed to end conversation:', error);
      throw error;
    }
  }

  // Daily.js integration helpers
  static createDailyCall(roomUrl: string): DailyIframe {
    return DailyIframe.createCallObject({
      url: roomUrl,
      showLeaveButton: true,
      showFullscreenButton: true,
      showLocalVideo: true,
      showParticipantsBar: true,
    });
  }

  static async joinCall(
    callObject: DailyIframe,
    container?: HTMLElement
  ): Promise<void> {
    try {
      if (container) {
        await callObject.join({ url: callObject.properties.url });
        // For iframe mode, we'll handle the iframe creation in the component
      } else {
        await callObject.join();
      }
    } catch (error) {
      console.error('Failed to join Daily call:', error);
      throw error;
    }
  }

  static async leaveCall(callObject: DailyIframe): Promise<void> {
    try {
      await callObject.leave();
      callObject.destroy();
    } catch (error) {
      console.error('Failed to leave Daily call:', error);
      throw error;
    }
  }

  // Utility methods
  getPersonaInfo() {
    return {
      personaId: this.personaId,
      replicaId: this.replicaId,
      name: 'UnionBolt Job Steward Support Specialist',
      role: 'Labor Rights Advocate',
    };
  }

  validateConfiguration(): boolean {
    return !!(this.apiKey && this.personaId && this.replicaId && this.baseUrl);
  }
}

// Export singleton instance
export const tavusClient = new TavusClient();