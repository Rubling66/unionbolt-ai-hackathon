import TavusVideoChat from '@/components/TavusVideoChat';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shane Keelan AI Agent | UnionBolt AI',
  description: 'Real-time video conversation with Shane Keelan AI persona powered by Tavus',
};

export default function TavusChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shane Keelan AI Agent
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience real-time video conversations with our advanced AI persona. 
            Powered by Tavus technology for natural, engaging interactions.
          </p>
        </div>
        
        <TavusVideoChat />
        
        <div className="mt-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              About Shane Keelan AI Agent
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Real-time Interaction
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Engage in natural conversations with lifelike video responses and real-time audio processing.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Advanced AI Persona
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Shane Keelan persona brings expertise and personality to every conversation with contextual understanding.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Secure & Private
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All conversations are encrypted and secure, with optional recording and transcription features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}