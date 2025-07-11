'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Shield, 
  Lock, 
  CheckCircle, 
  ArrowLeft,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import PayPalPaymentForm from '@/components/checkout/PayPalPaymentForm';
import GooglePayButton from '@/components/checkout/GooglePayButton';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  features: string[];
}

const pricingPlans = {
  apprentice: {
    id: 'apprentice',
    name: 'Apprentice',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: ['Basic AI Chat', 'Document Search', 'Email Support']
  },
  journeyman: {
    id: 'journeyman', 
    name: 'Journeyman',
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: ['Advanced AI Chat', 'Priority Support', 'Custom Integrations', 'Analytics Dashboard']
  },
  master: {
    id: 'master',
    name: 'Master',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    features: ['Enterprise AI', '24/7 Support', 'White-label Options', 'Advanced Analytics', 'Custom Training']
  }
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'paypal' | 'googlepay'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [billingInfo, setBillingInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  useEffect(() => {
    setMounted(true);
    
    // Get plan details from URL params
    const planId = searchParams.get('plan') || 'journeyman';
    const billing = (searchParams.get('billing') as 'monthly' | 'yearly') || 'monthly';
    
    const plan = pricingPlans[planId as keyof typeof pricingPlans];
    if (plan) {
      setPlanDetails({
        id: plan.id,
        name: plan.name,
        price: billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice,
        billing,
        features: plan.features
      });
    }
  }, [searchParams]);

  if (!mounted || !planDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  const handlePaymentSuccess = () => {
    setOrderComplete(true);
  };

  const handleBillingInfoChange = (field: string, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card/50 border-green-500/50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to UnionBolt AI {planDetails.name} plan. You'll receive a confirmation email shortly.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mr-4 text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <Card className="bg-card/50 border-border mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white">{planDetails.name} Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        Billed {planDetails.billing}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">${planDetails.price}</p>
                      <p className="text-sm text-muted-foreground">
                        {planDetails.billing === 'yearly' ? '/year' : '/month'}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Included Features:</h4>
                    {planDetails.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span className="text-white">Total</span>
                    <span className="text-green-500">${planDetails.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Badges */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: Shield, text: 'SSL Secured' },
                { icon: Lock, text: 'Encrypted' },
                { icon: CheckCircle, text: 'PCI Compliant' }
              ].map((badge, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <badge.icon className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">{badge.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="order-1 lg:order-2">
            {/* Billing Information */}
            <Card className="bg-card/50 border-border mb-6">
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={billingInfo.firstName}
                      onChange={(e) => handleBillingInfoChange('firstName', e.target.value)}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={billingInfo.lastName}
                      onChange={(e) => handleBillingInfoChange('lastName', e.target.value)}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={billingInfo.email}
                      onChange={(e) => handleBillingInfoChange('email', e.target.value)}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="company">Company/Union (Optional)</Label>
                    <Input
                      id="company"
                      value={billingInfo.company}
                      onChange={(e) => handleBillingInfoChange('company', e.target.value)}
                      className="bg-background/50 border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Payment Method Selection */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[
                    { id: 'stripe', name: 'Credit Card', icon: CreditCard },
                    { id: 'paypal', name: 'PayPal', icon: null },
                    { id: 'googlepay', name: 'Google Pay', icon: null }
                  ].map((method) => (
                    <Button
                      key={method.id}
                      variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                      onClick={() => setSelectedPaymentMethod(method.id as any)}
                      className={`h-16 ${selectedPaymentMethod === method.id ? 'bg-green-500 hover:bg-green-600 text-black' : 'border-border hover:bg-muted/10'}`}
                    >
                      <div className="text-center">
                        {method.icon && <method.icon className="w-5 h-5 mx-auto mb-1" />}
                        <div className="text-xs">{method.name}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Payment Forms */}
                {selectedPaymentMethod === 'stripe' && (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      planDetails={planDetails}
                      billingInfo={billingInfo}
                      onSuccess={handlePaymentSuccess}
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                    />
                  </Elements>
                )}

                {selectedPaymentMethod === 'paypal' && (
                  <PayPalScriptProvider options={{
                    'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                    currency: 'USD'
                  }}>
                    <PayPalPaymentForm
                      planDetails={planDetails}
                      billingInfo={billingInfo}
                      onSuccess={handlePaymentSuccess}
                      isProcessing={isProcessing}
                      setIsProcessing={setIsProcessing}
                    />
                  </PayPalScriptProvider>
                )}

                {selectedPaymentMethod === 'googlepay' && (
                  <GooglePayButton
                    planDetails={planDetails}
                    billingInfo={billingInfo}
                    onSuccess={handlePaymentSuccess}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}