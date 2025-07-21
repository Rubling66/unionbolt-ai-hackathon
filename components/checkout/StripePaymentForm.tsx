'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

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

interface StripePaymentFormProps {
  planDetails: PlanDetails;
  billingInfo: BillingInfo;
  onSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function StripePaymentForm({
  planDetails,
  billingInfo,
  onSuccess,
  isProcessing,
  setIsProcessing
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planDetails.price * 100, // Convert to cents
          currency: 'usd',
          planId: planDetails.id,
          billing: planDetails.billing,
          customerInfo: billingInfo
        }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        setError(backendError);
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${billingInfo.firstName} ${billingInfo.lastName}`,
              email: billingInfo.email,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'An error occurred during payment');
        setIsProcessing(false);
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment successful
        onSuccess();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#6b7280',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ef4444',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Element */}
      <div className="p-4 border border-border rounded-lg bg-background/50">
        <CardElement
          options={cardElementOptions}
          onChange={(event) => {
            setCardComplete(event.complete);
            if (event.error) {
              setError(event.error.message);
            } else {
              setError(null);
            }
          }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !cardComplete || isProcessing || !billingInfo.email || !billingInfo.firstName || !billingInfo.lastName}
        className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${planDetails.price} - Complete Order`
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center text-sm text-muted-foreground">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p>Powered by Stripe - PCI DSS compliant</p>
      </div>
    </form>
  );
}