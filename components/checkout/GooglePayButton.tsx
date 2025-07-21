'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Smartphone } from 'lucide-react';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  features: string[];
}

interface BillingInfo {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface GooglePayButtonProps {
  planDetails: PlanDetails;
  billingInfo: BillingInfo;
  onSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (options: any) => any;
        };
      };
    };
  }
}

export default function GooglePayButton({
  planDetails,
  billingInfo,
  onSuccess,
  isProcessing,
  setIsProcessing
}: GooglePayButtonProps) {
  const [googlePayReady, setGooglePayReady] = useState(false);
  const [googlePayClient, setGooglePayClient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);

  useEffect(() => {
    const initializeGooglePay = async () => {
      try {
        // Load Google Pay script
        if (!window.google?.payments?.api) {
          const script = document.createElement('script');
          script.src = 'https://pay.google.com/gp/p/js/pay.js';
          script.onload = () => initGooglePayClient();
          document.head.appendChild(script);
        } else {
          initGooglePayClient();
        }
      } catch (err) {
        console.error('Failed to load Google Pay:', err);
        setError('Google Pay is not available');
      }
    };

    const initGooglePayClient = () => {
      if (!window.google?.payments?.api) {
        setError('Google Pay API not available');
        return;
      }

      const client = new window.google.payments.api.PaymentsClient({
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
      });

      setGooglePayClient(client);
      checkGooglePayAvailability(client);
    };

    const checkGooglePayAvailability = async (client: any) => {
      try {
        const isReadyToPay = await client.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX']
            }
          }]
        });

        if (isReadyToPay.result) {
          setIsGooglePayAvailable(true);
          setGooglePayReady(true);
        } else {
          setError('Google Pay is not available on this device');
        }
      } catch (err) {
        console.error('Google Pay availability check failed:', err);
        setError('Unable to check Google Pay availability');
      }
    };

    initializeGooglePay();
  }, []);

  const handleGooglePayClick = async () => {
    if (!googlePayClient || !googlePayReady) {
      setError('Google Pay is not ready');
      return;
    }

    if (!billingInfo.email || !billingInfo.firstName || !billingInfo.lastName) {
      setError('Please fill in all required billing information');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe',
              'stripe:version': '2020-08-27',
              'stripe:publishableKey': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
            }
          }
        }],
        merchantInfo: {
          merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID || '',
          merchantName: 'UnionBolt AI'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: planDetails.price.toString(),
          currencyCode: 'USD',
          displayItems: [{
            label: `${planDetails.name} Plan (${planDetails.billing})`,
            type: 'LINE_ITEM',
            price: planDetails.price.toString()
          }]
        },
        shippingAddressRequired: false,
        emailRequired: true
      };

      const paymentData = await googlePayClient.loadPaymentData(paymentDataRequest);
      
      // Process the payment with your backend
      const response = await fetch('/api/payments/google-pay/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData,
          planId: planDetails.id,
          billing: planDetails.billing,
          customerInfo: billingInfo,
          amount: planDetails.price * 100 // Convert to cents
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
        setIsProcessing(false);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      if (err.statusCode === 'CANCELED') {
        setError('Payment was cancelled');
      } else {
        setError('Google Pay payment failed. Please try again.');
      }
      setIsProcessing(false);
      console.error('Google Pay error:', err);
    }
  };

  if (!googlePayReady && !error) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2 text-muted-foreground">Loading Google Pay...</span>
      </div>
    );
  }

  if (!isGooglePayAvailable || error) {
    return (
      <div className="space-y-4">
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Smartphone className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">
            {error || 'Google Pay is not available on this device. Please use another payment method.'}
          </AlertDescription>
        </Alert>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Google Pay requires:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>A supported browser (Chrome, Safari, Edge)</li>
            <li>A saved payment method in your Google account</li>
            <li>A secure connection (HTTPS)</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Check */}
      {(!billingInfo.email || !billingInfo.firstName || !billingInfo.lastName) && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">
            Please fill in all required billing information before proceeding with Google Pay.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Google Pay Button */}
      <Button
        onClick={handleGooglePayClick}
        disabled={!billingInfo.email || !billingInfo.firstName || !billingInfo.lastName || isProcessing}
        className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 text-lg border border-gray-300 rounded-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Pay with Google Pay
            </div>
          </>
        )}
      </Button>

      {/* Order Summary */}
      <div className="bg-background/50 border border-border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">Plan:</span>
          <span className="text-white font-medium">{planDetails.name}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">Billing:</span>
          <span className="text-white font-medium">
            {planDetails.billing === 'yearly' ? 'Yearly' : 'Monthly'}
          </span>
        </div>
        <div className="flex justify-between items-center font-bold text-lg border-t border-border pt-2">
          <span className="text-white">Total:</span>
          <span className="text-green-500">${planDetails.price}</span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="text-center text-sm text-muted-foreground">
        <p>🔒 Secure payment processing by Google</p>
        <p>Your payment information is encrypted and protected</p>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-white font-medium">Processing your Google Pay payment...</p>
            <p className="text-muted-foreground text-sm">Please don't close this window</p>
          </div>
        </div>
      )}
    </div>
  );
}