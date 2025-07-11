import { Metadata } from 'next';
import UnionStewardVideo from '@/components/video-chat/UnionStewardVideo';
import { Shield, Users, Scale, Clock, CheckCircle, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Video Steward Consultation | UnionBolt AI Dashboard',
  description: 'Connect with your dedicated Job Steward Support Specialist for real-time labor rights consultation and workplace advocacy.',
  keywords: 'labor rights, job steward, workplace consultation, union support, employee advocacy',
};

export default function VideoStewardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-blue-500 rounded-full mr-4">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Video Steward Consultation
              </h1>
              <p className="text-xl text-blue-600 dark:text-blue-400 font-medium">
                UnionBolt Job Steward Support Specialist
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Connect face-to-face with your dedicated Labor Rights Advocate for personalized 
            workplace consultation, union guidance, and employee rights support.
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex justify-center space-x-4 mb-8">
          <Badge variant="default" className="bg-green-500 text-white px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Service Active
          </Badge>
          <Badge variant="outline" className="border-blue-500 text-blue-600 px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            24/7 Available
          </Badge>
          <Badge variant="outline" className="border-purple-500 text-purple-600 px-4 py-2">
            <Star className="h-4 w-4 mr-2" />
            Expert Support
          </Badge>
        </div>
        
        {/* Main Video Component */}
        <UnionStewardVideo />
        
        {/* Information Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Labor Rights Advocacy
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI-powered Job Steward provides expert guidance on workplace issues, 
              union matters, and employee rights with the knowledge and experience of a seasoned advocate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center pb-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto w-fit mb-3">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                  Workplace Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Expert guidance on employee rights, workplace safety, and legal protections under labor law.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="text-center pb-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mx-auto w-fit mb-3">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg text-green-900 dark:text-green-100">
                  Union Support
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Comprehensive union guidance, collective bargaining support, and membership advocacy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center pb-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto w-fit mb-3">
                  <Scale className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                  Dispute Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Professional mediation and advocacy for workplace disputes and grievance procedures.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="text-center pb-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto w-fit mb-3">
                  <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                  24/7 Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Round-the-clock access to expert labor advocacy when workplace issues arise.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Video Steward Consultation Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple, secure, and professional consultation process designed for your convenience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-500 text-white rounded-full mx-auto w-fit mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Start Consultation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Click "Start Consultation" to begin your secure video session with the Job Steward Support Specialist.
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-green-500 text-white rounded-full mx-auto w-fit mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Discuss Your Situation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share your workplace concerns, union questions, or employee rights issues in a confidential environment.
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-purple-500 text-white rounded-full mx-auto w-fit mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Get Expert Guidance
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive professional advice, actionable solutions, and ongoing support for your workplace challenges.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Security Notice */}
        <div className="mt-12">
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Privacy & Security Commitment
                </h3>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                All video consultations are end-to-end encrypted and completely confidential. 
                Your workplace discussions and personal information are protected by the highest security standards. 
                No session recordings are stored without your explicit consent.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}