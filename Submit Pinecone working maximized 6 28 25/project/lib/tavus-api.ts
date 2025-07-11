import DailyIframe from '@daily-co/daily-js';

interface TavusConfig {
  apiKey: string;
  baseUrl: string;
  personaId: string;
  replicaId: string;
}

interface ConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

interface ConversationStatus {
  conversation_id: string;
  status: 'active' | 'ended' | 'failed';
  participant_count: number;
}

export class TavusAPI {
  private config: TavusConfig;
  private dailyCall: any = null;

  constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_TAVUS_API_KEY || process.env.TAVUS_API_KEY || '',
      baseUrl: process.env.NEXT_PUBLIC_TAVUS_BASE_URL || process.env.TAVUS_BASE_URL || 'https://tavusapi.com/v2',
      personaId: process.env.NEXT_PUBLIC_TAVUS_PERSONA_ID || process.env.TAVUS_PERSONA_ID || '',
      replicaId: process.env.NEXT_PUBLIC_TAVUS_REPLICA_ID || process.env.TAVUS_REPLICA_ID || ''
    };

    if (!this.config.apiKey) {
      throw new Error('Tavus API key is required');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavus API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async createConversation(): Promise<ConversationResponse> {
    try {
      const response = await this.makeRequest('/conversations', {
        method: 'POST',
        body: JSON.stringify({
          replica_id: this.config.replicaId,
          persona_id: this.config.personaId,
          conversation_name: `Shane Keelan Chat - ${new Date().toISOString()}`,
          callback_url: null,
          properties: {
            max_call_duration: 600,
            participant_left_timeout: 60,
            enable_recording: false,
            enable_transcription: true
          }
        })
      });

      return response;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  async getConversationStatus(conversationId: string): Promise<ConversationStatus> {
    try {
      const response = await this.makeRequest(`/conversations/${conversationId}`);
      return response;
    } catch (error) {
      console.error('Failed to get conversation status:', error);
      throw error;
    }
  }

  async endConversation(conversationId: string): Promise<void> {
    try {
      await this.makeRequest(`/conversations/${conversationId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to end conversation:', error);
      throw error;
    }
  }

  async joinConversation(conversationUrl: string, containerElement: HTMLElement): Promise<any> {
    try {
      // Create Daily call instance
      this.dailyCall = DailyIframe.createCallObject({
        showLeaveButton: true,
        showFullscreenButton: true,
        showLocalVideo: true,
        showParticipantsBar: true,
        theme: {
          colors: {
            accent: '#3B82F6',
            accentText: '#FFFFFF',
            background: '#1F2937',
            backgroundAccent: '#374151',
            baseText: '#F9FAFB',
            border: '#6B7280',
            mainAreaBg: '#111827',
            mainAreaBgAccent: '#1F2937',
            mainAreaText: '#F9FAFB',
            supportiveText: '#D1D5DB'
          }
        }
      });

      // Join the conversation
      await this.dailyCall.join({ url: conversationUrl });

      // Append to container
      if (containerElement) {
        this.dailyCall.iframe().style.width = '100%';
        this.dailyCall.iframe().style.height = '100%';
        this.dailyCall.iframe().style.border = 'none';
        this.dailyCall.iframe().style.borderRadius = '12px';
        containerElement.appendChild(this.dailyCall.iframe());
      }

      return this.dailyCall;
    } catch (error) {
      console.error('Failed to join conversation:', error);
      throw error;
    }
  }

  async leaveConversation(): Promise<void> {
    try {
      if (this.dailyCall) {
        await this.dailyCall.leave();
        this.dailyCall.destroy();
        this.dailyCall = null;
      }
    } catch (error) {
      console.error('Failed to leave conversation:', error);
      throw error;
    }
  }

  getDailyCall() {
    return this.dailyCall;
  }

  isInCall(): boolean {
    return this.dailyCall && this.dailyCall.meetingState() === 'joined';
  }
}

export const tavusAPI = new TavusAPI();