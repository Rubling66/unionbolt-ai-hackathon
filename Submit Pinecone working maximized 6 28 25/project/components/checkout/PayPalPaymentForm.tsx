'use client';

import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
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

interface PayPalPaymentFormProps {
  planDetails: PlanDetails;
  billingInfo: BillingInfo;
  onSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function PayPalPaymentForm({
  planDetails,
  billingInfo,
  onSuccess,
  isProcessing,
  setIsProcessing
}: PayPalPaymentFormProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [error, setError] = useState<string | null>(null);

  const createOrder = async () => {
    try {
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planDetails.price,
          currency: 'USD',
          planId: planDetails.id,
          billing: planDetails.billing,
          customerInfo: billingInfo
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return '';
      }

      return data.orderID;
    } catch (err) {
      setError('Failed to create PayPal order');
      return '';
    }
  };

  const onApprove = async (data: any) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          planId: planDetails.id,
          customerInfo: billingInfo
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
        setIsProcessing(false);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to capture PayPal payment');
      setIsProcessing(false);
    }
  };

  const onError = (err: any) => {
    setError('PayPal payment failed. Please try again.');
    setIsProcessing(false);
    console.error('PayPal error:', err);
  };

  const onCancel = () => {
    setError('Payment was cancelled');
    setIsProcessing(false);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2 text-muted-foreground">Loading PayPal...</span>
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
            Please fill in all required billing information before proceeding with PayPal.
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

      {/* PayPal Buttons */}
      <div className="paypal-buttons-container">
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 50
          }}
          disabled={!billingInfo.email || !billingInfo.firstName || !billingInfo.lastName || isProcessing}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
        />
      </div>

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
        <p>🔒 Secure payment processing by PayPal</p>
        <p>Your financial information is never shared with us</p>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-white font-medium">Processing your PayPal payment...</p>
            <p className="text-muted-foreground text-sm">Please don't close this window</p>
          </div>
        </div>
      )}
    </div>
  );
}