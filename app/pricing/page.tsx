'use client';

import { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  MessageSquare, 
  FileText, 
  Clock, 
  Globe, 
  AlertTriangle, 
  Mic, 
  BarChart3, 
  Upload,
  ArrowRight,
  Users,
  Building,
  Phone,
  Mail,
  Shield,
  Award,
  Sparkles,
  Crown,
  ChevronDown,
  ChevronUp,
  Calculator,
  TrendingUp,
  Lock,
  Verified,
  Quote,
  DollarSign,
  UserCheck,
  BookOpen,
  HeadphonesIcon,
  Briefcase,
  Target,
  Lightbulb,
  Heart,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  CreditCard,
  RefreshCw,
  Database,
  Handshake,
  Scale,
  GraduationCap,
  Wrench,
  HardHat,
  Factory,
  Truck,
  Home,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

// Pricing plans data
const pricingPlans = [
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Perfect for new union members starting their journey',
    monthlyPrice: 5.24,
    yearlyPrice: 52.40,
    yearlyDiscount: 17,
    popular: false,
    color: 'blue',
    icon: Users,
    features: {
      aiMessages: { value: 25, label: '25 AI messages/month', level: 'basic' },
      documentAccess: { value: 'Basic', label: 'Basic document library', level: 'basic' },
      supportResponse: { value: '48 hours', label: '48-hour support response', level: 'basic' },
      languageSupport: { value: 'English', label: 'English only', level: 'basic' },
      grievanceFiling: { value: false, label: 'Grievance filing assistance', level: 'none' },
      voiceCommands: { value: false, label: 'Voice command support', level: 'none' },
      analyticsDashboard: { value: false, label: 'Analytics dashboard', level: 'none' },
      fileUploads: { value: '1 GB', label: '1 GB file storage', level: 'basic' },
      prioritySupport: { value: false, label: 'Priority support', level: 'none' },
      customIntegrations: { value: false, label: 'Custom integrations', level: 'none' },
      advancedReporting: { value: false, label: 'Advanced reporting', level: 'none' },
      apiAccess: { value: false, label: 'API access', level: 'none' }
    },
    benefits: [
      'AI-powered union knowledge base',
      'Basic safety protocol access',
      'Community forum participation',
      'Mobile app access',
      'Email support'
    ],
    idealFor: 'New union members, apprentices, part-time workers',
    savings: 'Save $10.48 annually'
  },
  {
    id: 'journeyman',
    name: 'Journeyman',
    description: 'Most popular choice for experienced union members',
    monthlyPrice: 7.49,
    yearlyPrice: 74.90,
    yearlyDiscount: 17,
    popular: true,
    color: 'green',
    icon: Award,
    features: {
      aiMessages: { value: 100, label: '100 AI messages/month', level: 'enhanced' },
      documentAccess: { value: 'Enhanced', label: 'Enhanced document access', level: 'enhanced' },
      supportResponse: { value: '24 hours', label: '24-hour support response', level: 'enhanced' },
      languageSupport: { value: '5 languages', label: '5 language support', level: 'enhanced' },
      grievanceFiling: { value: true, label: 'Grievance filing assistance', level: 'enhanced' },
      voiceCommands: { value: true, label: 'Voice command support', level: 'enhanced' },
      analyticsDashboard: { value: 'Basic', label: 'Basic analytics dashboard', level: 'enhanced' },
      fileUploads: { value: '10 GB', label: '10 GB file storage', level: 'enhanced' },
      prioritySupport: { value: false, label: 'Priority support', level: 'none' },
      customIntegrations: { value: false, label: 'Custom integrations', level: 'none' },
      advancedReporting: { value: false, label: 'Advanced reporting', level: 'none' },
      apiAccess: { value: false, label: 'API access', level: 'none' }
    },
    benefits: [
      'Everything in Apprentice',
      'Advanced AI conversation capabilities',
      'Grievance filing and tracking',
      'Voice command interface',
      'Priority email support',
      'Training progress tracking',
      'Safety incident reporting'
    ],
    idealFor: 'Experienced workers, journeymen, full-time members',
    savings: 'Save $14.98 annually'
  },
  {
    id: 'steward',
    name: 'Steward',
    description: 'Complete solution for union leaders and stewards',
    monthlyPrice: 14.99,
    yearlyPrice: 149.90,
    yearlyDiscount: 17,
    popular: false,
    color: 'purple',
    icon: Crown,
    features: {
      aiMessages: { value: 'Unlimited', label: 'Unlimited AI messages', level: 'complete' },
      documentAccess: { value: 'Complete', label: 'Complete document library', level: 'complete' },
      supportResponse: { value: '4 hours', label: '4-hour support response', level: 'complete' },
      languageSupport: { value: '15+ languages', label: '15+ language support', level: 'complete' },
      grievanceFiling: { value: true, label: 'Advanced grievance management', level: 'complete' },
      voiceCommands: { value: true, label: 'Advanced voice commands', level: 'complete' },
      analyticsDashboard: { value: 'Advanced', label: 'Advanced analytics dashboard', level: 'complete' },
      fileUploads: { value: '100 GB', label: '100 GB file storage', level: 'complete' },
      prioritySupport: { value: true, label: 'Priority phone support', level: 'complete' },
      customIntegrations: { value: true, label: 'Custom integrations', level: 'complete' },
      advancedReporting: { value: true, label: 'Advanced reporting suite', level: 'complete' },
      apiAccess: { value: true, label: 'Full API access', level: 'complete' }
    },
    benefits: [
      'Everything in Journeyman',
      'Unlimited AI conversations',
      'Advanced member management',
      'Custom reporting and analytics',
      'Priority phone support',
      'API access for integrations',
      'White-label options',
      'Dedicated account manager'
    ],
    idealFor: 'Union stewards, leaders, local administrators',
    savings: 'Save $29.98 annually'
  }
];

// Feature categories for comparison
const featureCategories = [
  {
    name: 'AI & Communication',
    icon: MessageSquare,
    features: [
      { key: 'aiMessages', name: 'AI Messages per Month', icon: MessageSquare, description: 'Chat with our AI assistant for union guidance' },
      { key: 'voiceCommands', name: 'Voice Commands', icon: Mic, description: 'Hands-free interaction with voice recognition' },
      { key: 'languageSupport', name: 'Language Support', icon: Globe, description: 'Multi-language support for diverse membership' }
    ]
  },
  {
    name: 'Documents & Storage',
    icon: FileText,
    features: [
      { key: 'documentAccess', name: 'Document Access Level', icon: FileText, description: 'Access to union contracts, policies, and resources' },
      { key: 'fileUploads', name: 'File Storage', icon: Upload, description: 'Secure cloud storage for your union documents' }
    ]
  },
  {
    name: 'Union Services',
    icon: Scale,
    features: [
      { key: 'grievanceFiling', name: 'Grievance Filing', icon: AlertTriangle, description: 'Digital grievance filing and tracking system' },
      { key: 'supportResponse', name: 'Support Response Time', icon: Clock, description: 'Guaranteed response time for support requests' }
    ]
  },
  {
    name: 'Analytics & Reporting',
    icon: BarChart3,
    features: [
      { key: 'analyticsDashboard', name: 'Analytics Dashboard', icon: BarChart3, description: 'Track your union activity and engagement' },
      { key: 'advancedReporting', name: 'Advanced Reporting', icon: BarChart3, description: 'Detailed reports and insights for leaders' }
    ]
  },
  {
    name: 'Enterprise Features',
    icon: Building,
    features: [
      { key: 'prioritySupport', name: 'Priority Support', icon: Shield, description: 'Fast-track support with dedicated channels' },
      { key: 'customIntegrations', name: 'Custom Integrations', icon: Zap, description: 'Connect with your existing union systems' },
      { key: 'apiAccess', name: 'API Access', icon: Zap, description: 'Full API access for custom development' }
    ]
  }
];

// FAQ data
const faqData = [
  {
    id: 1,
    question: "Can I change my plan anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences. If you upgrade mid-cycle, you'll only pay the difference for the remaining time. Downgrades will credit your account for future billing.",
    icon: RefreshCw,
    category: "billing"
  },
  {
    id: 2,
    question: "What's included in the 3-day free trial?",
    answer: "Your free trial includes full access to all features of your chosen plan. No credit card required, and you can cancel anytime during the trial period. You'll get complete access to AI chat, document library, grievance tools, and all premium features to fully evaluate the platform.",
    icon: Clock,
    category: "trial"
  },
  {
    id: 3,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), ACH bank transfers, and can accommodate purchase orders for enterprise customers. For union locals with 50+ members, we also offer invoicing and net-30 payment terms.",
    icon: CreditCard,
    category: "payment"
  },
  {
    id: 4,
    question: "How secure is my union data?",
    answer: "We use enterprise-grade encryption (AES-256) and comply with SOC 2 Type II, GDPR, and CCPA regulations. Your union data is never shared with third parties, stored in secure data centers, and backed up daily. We maintain strict access controls and regular security audits.",
    icon: Lock,
    category: "security"
  },
  {
    id: 5,
    question: "Do you offer discounts for large unions?",
    answer: "Yes! We offer volume discounts starting at 10% for unions with 100+ members, 15% for 500+ members, and 20% for 1000+ members. We also provide special pricing for multi-local organizations and can create custom enterprise packages for large union networks.",
    icon: Users,
    category: "discounts"
  },
  {
    id: 6,
    question: "What happens to my conversation history?",
    answer: "All your AI conversations and union documents are securely stored and remain accessible throughout your subscription. If you cancel, you have 90 days to export your data. We provide easy export tools in JSON and PDF formats, and can assist with data migration if needed.",
    icon: Database,
    category: "data"
  }
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Maria Santos",
    title: "Shop Steward",
    local: "IBEW Local 1245",
    avatar: "MS",
    rating: 5,
    quote: "UnionBolt AI has revolutionized how we handle member questions. The AI assistant knows our contract inside and out, and I can resolve grievances 3x faster than before.",
    metrics: "Resolved 47 grievances this quarter",
    industry: "Electrical"
  },
  {
    id: 2,
    name: "James Mitchell",
    title: "Business Agent",
    local: "Teamsters Local 853",
    avatar: "JM",
    rating: 5,
    quote: "The analytics dashboard gives us incredible insights into member engagement. We've increased training participation by 65% since implementing UnionBolt AI.",
    metrics: "Serves 2,400+ members",
    industry: "Transportation"
  },
  {
    id: 3,
    name: "Sarah Chen",
    title: "Safety Coordinator",
    local: "UAW Local 2865",
    avatar: "SC",
    rating: 5,
    quote: "Safety incident reporting is now seamless. Members can quickly report hazards through the AI chat, and we've reduced workplace accidents by 40% this year.",
    metrics: "40% reduction in accidents",
    industry: "Manufacturing"
  },
  {
    id: 4,
    name: "Robert Johnson",
    title: "Training Director",
    local: "Carpenters Local 713",
    avatar: "RJ",
    rating: 5,
    quote: "The training modules and progress tracking have transformed our apprenticeship program. Completion rates are up 80%, and apprentices love the interactive AI guidance.",
    metrics: "80% higher completion rates",
    industry: "Construction"
  }
];

// Usage statistics
const usageStats = [
  {
    icon: MessageSquare,
    value: "2.4M+",
    label: "AI Conversations",
    description: "Monthly AI interactions across all union locals"
  },
  {
    icon: Users,
    value: "150+",
    label: "Union Locals",
    description: "Active union locals using UnionBolt AI"
  },
  {
    icon: FileText,
    value: "98%",
    label: "Issue Resolution",
    description: "Member questions resolved on first contact"
  },
  {
    icon: TrendingUp,
    value: "45%",
    label: "Efficiency Gain",
    description: "Average improvement in union operations"
  },
  {
    icon: Shield,
    value: "99.9%",
    label: "Uptime",
    description: "Platform reliability and availability"
  },
  {
    icon: Clock,
    value: "< 2 min",
    label: "Response Time",
    description: "Average AI response time for member queries"
  }
];

// Trust indicators
const trustIndicators = [
  {
    icon: Shield,
    title: "SOC 2 Certified",
    description: "Enterprise security standards"
  },
  {
    icon: Lock,
    title: "GDPR Compliant",
    description: "Data protection compliance"
  },
  {
    icon: Verified,
    title: "Union Endorsed",
    description: "Approved by AFL-CIO"
  },
  {
    icon: Award,
    title: "Industry Leader",
    description: "Top-rated union platform"
  }
];

// Feature benefits by tier
const tierBenefits = {
  apprentice: {
    title: "Perfect for New Members",
    description: "Get started with essential union tools and AI assistance",
    highlights: [
      { icon: MessageSquare, text: "AI-powered union guidance" },
      { icon: BookOpen, text: "Basic contract and policy access" },
      { icon: HeadphonesIcon, text: "Email support included" },
      { icon: Shield, text: "Safety protocol guidance" }
    ]
  },
  journeyman: {
    title: "Complete Union Experience",
    description: "Everything you need for active union participation and leadership",
    highlights: [
      { icon: AlertTriangle, text: "Full grievance filing system" },
      { icon: Mic, text: "Voice command interface" },
      { icon: BarChart3, text: "Personal analytics dashboard" },
      { icon: GraduationCap, text: "Training progress tracking" }
    ]
  },
  steward: {
    title: "Union Leadership Tools",
    description: "Advanced features for stewards, leaders, and local administrators",
    highlights: [
      { icon: Users, text: "Member management tools" },
      { icon: Building, text: "Custom integrations" },
      { icon: Phone, text: "Priority phone support" },
      { icon: Zap, text: "Full API access" }
    ]
  }
};

export default function PricingPage() {
  const [mounted, setMounted] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState(false);
  const [loadingTrial, setLoadingTrial] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('journeyman');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleStartTrial = (planId: string) => {
    setLoadingTrial(planId);
    
    setTimeout(() => {
      setLoadingTrial(null);
      // Redirect to checkout page with plan and billing parameters
      const billing = isYearly ? 'yearly' : 'monthly';
      window.location.href = `/checkout?plan=${planId}&billing=${billing}`;
    }, 1000);
  };

  const getFeatureIcon = (level: string) => {
    switch (level) {
      case 'complete':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'enhanced':
        return <Check className="w-5 h-5 text-blue-500" />;
      case 'basic':
        return <Check className="w-5 h-5 text-gray-500" />;
      default:
        return <X className="w-5 h-5 text-red-500" />;
    }
  };

  const getFeatureLabel = (level: string) => {
    switch (level) {
      case 'complete':
        return 'Complete';
      case 'enhanced':
        return 'Enhanced';
      case 'basic':
        return 'Basic';
      default:
        return '';
    }
  };

  const getPlanColorClasses = (color: string, variant: 'border' | 'bg' | 'text' | 'button') => {
    const colors = {
      blue: {
        border: 'border-blue-500/50',
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      green: {
        border: 'border-green-500/50',
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        button: 'bg-green-500 hover:bg-green-600'
      },
      purple: {
        border: 'border-purple-500/50',
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        button: 'bg-purple-500 hover:bg-purple-600'
      }
    };
    return colors[color as keyof typeof colors][variant];
  };

  const calculateTotalPrice = () => {
    const plan = pricingPlans.find(p => p.id === selectedPlan);
    if (!plan) return 0;
    
    const basePrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    let totalPrice = basePrice * memberCount;
    
    // Volume discounts
    if (memberCount >= 1000) {
      totalPrice *= 0.8; // 20% discount
    } else if (memberCount >= 500) {
      totalPrice *= 0.85; // 15% discount
    } else if (memberCount >= 100) {
      totalPrice *= 0.9; // 10% discount
    }
    
    return totalPrice;
  };

  const getVolumeDiscount = () => {
    if (memberCount >= 1000) return 20;
    if (memberCount >= 500) return 15;
    if (memberCount >= 100) return 10;
    return 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative floating-animation">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center pulse-glow">
                  <Sparkles className="w-10 h-10 text-green-500" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Choose Your </span>
              <span className="neon-text">Power Level</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Unlock the full potential of union knowledge with our AI-powered platform. 
              From apprentice to steward, we have the perfect plan for your journey.
            </p>

            {/* Usage Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {usageStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold neon-text">{stat.value}</div>
                  <div className="text-sm font-medium text-white">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </div>
              ))}
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={cn("text-sm font-medium", !isYearly ? "text-white" : "text-muted-foreground")}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-green-500"
              />
              <span className={cn("text-sm font-medium", isYearly ? "text-white" : "text-muted-foreground")}>
                Yearly
              </span>
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                Save 17%
              </Badge>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "relative bg-card/50 border-border transition-all duration-300 cursor-pointer group",
                  plan.popular && "ring-2 ring-green-500/50 scale-105",
                  hoveredPlan === plan.id && !plan.popular && "scale-105 shadow-lg",
                  getPlanColorClasses(plan.color, 'border')
                )}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-black font-semibold px-4 py-1 neon-glow">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                    getPlanColorClasses(plan.color, 'bg')
                  )}>
                    <plan.icon className={cn("w-8 h-8", getPlanColorClasses(plan.color, 'text'))} />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <p className="text-muted-foreground text-sm mb-4">
                    {plan.description}
                  </p>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-4xl font-bold text-white">
                        ${isYearly ? plan.yearlyPrice.toFixed(0) : plan.monthlyPrice.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                    
                    {isYearly && (
                      <div className="text-sm text-green-500">
                        {plan.savings}
                      </div>
                    )}
                  </div>

                  {/* Ideal For */}
                  <div className="mt-4 p-3 bg-background/30 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Ideal for:</div>
                    <div className="text-sm text-white">{plan.idealFor}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Key Features */}
                  <div className="space-y-3">
                    {plan.benefits.slice(0, 5).map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className={cn("w-4 h-4 flex-shrink-0", getPlanColorClasses(plan.color, 'text'))} />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                    
                    {plan.benefits.length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        + {plan.benefits.length - 5} more features
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="space-y-3">
                    <Button
                      className={cn(
                        "w-full font-semibold text-black transition-all duration-200",
                        getPlanColorClasses(plan.color, 'button'),
                        plan.popular && "neon-glow"
                      )}
                      onClick={() => handleStartTrial(plan.id)}
                      disabled={loadingTrial === plan.id}
                    >
                      {loadingTrial === plan.id ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Start 3-Day Free Trial
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      No credit card required • Cancel anytime
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Benefits Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                <span className="gradient-text">What Each Plan Provides</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Detailed breakdown of features and benefits for each membership tier
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {pricingPlans.map((plan) => {
                const benefits = tierBenefits[plan.id as keyof typeof tierBenefits];
                return (
                  <Card key={plan.id} className="bg-card/50 border-border">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          getPlanColorClasses(plan.color, 'bg')
                        )}>
                          <plan.icon className={cn("w-6 h-6", getPlanColorClasses(plan.color, 'text'))} />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{benefits.title}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{benefits.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {benefits.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              getPlanColorClasses(plan.color, 'bg')
                            )}>
                              <highlight.icon className={cn("w-4 h-4", getPlanColorClasses(plan.color, 'text'))} />
                            </div>
                            <span className="text-sm font-medium text-white">{highlight.text}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Pricing Calculator */}
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30 mb-16">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center space-x-2">
                <Calculator className="w-6 h-6 text-green-500" />
                <span className="gradient-text">Pricing Calculator</span>
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Calculate pricing for multiple members and get volume discounts
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="memberCount" className="text-sm font-medium">Number of Members</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        id="memberCount"
                        type="number"
                        value={memberCount}
                        onChange={(e) => setMemberCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center"
                        min="1"
                        max="10000"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMemberCount(memberCount + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Select Plan</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {pricingPlans.map((plan) => (
                        <Button
                          key={plan.id}
                          variant={selectedPlan === plan.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedPlan(plan.id)}
                          className={cn(
                            selectedPlan === plan.id && getPlanColorClasses(plan.color, 'button')
                          )}
                        >
                          {plan.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={isYearly}
                      onCheckedChange={setIsYearly}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <Label className="text-sm">Annual billing (17% discount)</Label>
                  </div>
                </div>

                <div className="bg-background/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Pricing Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base Price ({isYearly ? 'Annual' : 'Monthly'})</span>
                      <span>${(pricingPlans.find(p => p.id === selectedPlan)?.[isYearly ? 'yearlyPrice' : 'monthlyPrice'] || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Members</span>
                      <span>{memberCount.toLocaleString()}</span>
                    </div>
                    {getVolumeDiscount() > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>Volume Discount ({getVolumeDiscount()}%)</span>
                        <span>-${(calculateTotalPrice() / (1 - getVolumeDiscount() / 100) - calculateTotalPrice()).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="neon-text">${calculateTotalPrice().toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${(calculateTotalPrice() / memberCount).toFixed(2)} per member
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-6 bg-green-500 hover:bg-green-600 text-black font-semibold neon-glow">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Sales for Quote
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                <span className="gradient-text">Trusted by Union Leaders</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how union locals across industries are transforming their operations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="bg-card/50 border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-500 font-bold">{testimonial.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex space-x-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {testimonial.industry}
                          </Badge>
                        </div>
                        <blockquote className="text-sm text-muted-foreground mb-3 italic">
                          "{testimonial.quote}"
                        </blockquote>
                        <div className="space-y-1">
                          <div className="font-semibold text-white">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                          <div className="text-sm text-green-500">{testimonial.local}</div>
                          <div className="text-xs text-muted-foreground">{testimonial.metrics}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Feature Comparison Table */}
          <Card className="bg-card/50 border-border mb-16">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  <span className="gradient-text">Detailed Feature Comparison</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedFeatures(!expandedFeatures)}
                  className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                >
                  {expandedFeatures ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show All Features
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                        Features
                      </th>
                      {pricingPlans.map((plan) => (
                        <th key={plan.id} className="text-center py-4 px-4 min-w-[150px]">
                          <div className="flex flex-col items-center space-y-2">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              getPlanColorClasses(plan.color, 'bg')
                            )}>
                              <plan.icon className={cn("w-5 h-5", getPlanColorClasses(plan.color, 'text'))} />
                            </div>
                            <div className="font-semibold text-white">{plan.name}</div>
                            {plan.popular && (
                              <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {featureCategories.slice(0, expandedFeatures ? featureCategories.length : 3).map((category) => (
                      <div key={category.name} className="contents">
                        <tr>
                          <td colSpan={4} className="py-6">
                            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                              <category.icon className="w-5 h-5 text-green-500" />
                              <span>{category.name}</span>
                            </h3>
                          </td>
                        </tr>
                        
                        {category.features.map((feature) => (
                          <tr key={feature.key} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-3">
                                  <feature.icon className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium text-white">{feature.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground ml-7">{feature.description}</p>
                              </div>
                            </td>
                            
                            {pricingPlans.map((plan) => (
                              <td key={`${plan.id}-${feature.key}`} className="py-4 px-4 text-center">
                                <div className="flex flex-col items-center space-y-1">
                                  {getFeatureIcon(plan.features[feature.key as keyof typeof plan.features].level)}
                                  <span className="text-sm text-muted-foreground">
                                    {typeof plan.features[feature.key as keyof typeof plan.features].value === 'boolean'
                                      ? getFeatureLabel(plan.features[feature.key as keyof typeof plan.features].level)
                                      : plan.features[feature.key as keyof typeof plan.features].value
                                    }
                                  </span>
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </div>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">
                <span className="gradient-text">Trusted & Secure</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <indicator.icon className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{indicator.title}</h3>
                  <p className="text-sm text-muted-foreground">{indicator.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <Card className="bg-card/50 border-border mb-16">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                <span className="gradient-text">Frequently Asked Questions</span>
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Everything you need to know about our pricing and features
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {faqData.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <button
                      className="w-full p-4 text-left hover:bg-muted/10 transition-colors flex items-center justify-between"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <faq.icon className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-white">{faq.question}</span>
                      </div>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div className="p-4 pt-0 border-t border-border">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ready to Get Started CTA */}
          <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/50 mb-16">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-green-500/30 rounded-full flex items-center justify-center pulse-glow">
                    <Target className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold mb-4">
                  <span className="gradient-text">Ready to Get Started?</span>
                </h2>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Join thousands of union members who are already using UnionBolt AI to 
                  streamline their union experience and get instant access to union knowledge.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <Button 
                    size="lg" 
                    className="bg-green-500 hover:bg-green-600 text-black font-bold px-12 py-4 text-lg neon-glow group"
                  >
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-green-500/50 text-green-500 hover:bg-green-500/10 px-12 py-4 text-lg"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Talk to Sales
                  </Button>
                </div>
                
                <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>3-day free trial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Section */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Building className="w-8 h-8 text-purple-500" />
                    <h2 className="text-3xl font-bold text-white">Enterprise Solutions</h2>
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-6">
                    Custom solutions for large unions and organizations with specific requirements.
                    Get dedicated support, custom integrations, and enterprise-grade security.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {[
                      'Custom deployment options',
                      'Dedicated infrastructure', 
                      'Advanced security compliance',
                      'Custom AI training',
                      'White-label solutions',
                      'Dedicated account management'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold">
                      <Phone className="w-4 h-4 mr-2" />
                      Schedule Demo
                    </Button>
                    <Button variant="outline" className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Sales
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-background/50 rounded-lg p-6 border border-purple-500/30">
                    <h3 className="text-xl font-semibold text-white mb-4">Enterprise Features</h3>
                    <div className="space-y-3">
                      {[
                        'SLA guarantees',
                        'Custom integrations', 
                        'Advanced analytics',
                        'Multi-tenant management',
                        'Priority support',
                        'Training & onboarding'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-purple-500" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}