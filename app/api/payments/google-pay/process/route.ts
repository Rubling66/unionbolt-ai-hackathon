import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

// Save order to database (mock implementation)
async function saveOrderToDatabase(orderData: any) {
  // In a real application, you would save this to your database
  console.log('Saving Google Pay order to database:', {
    paymentIntentId: orderData.paymentIntentId,
    status: orderData.status,
    amount: orderData.amount,
    currency: orderData.currency,
    customerEmail: orderData.customerInfo.email,
    customerName: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
    planId: orderData.planId,
    paymentMethod: 'google_pay',
    createdAt: new Date().toISOString(),
  });
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { paymentData, planId, billing, customerInfo, amount } = await request.json();

    // Validate required fields
    if (!paymentData || !planId || !customerInfo || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount (should be in cents and positive)
    if (amount < 50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Amount too small' },
        { status: 400 }
      );
    }

    // Extract the payment token from Google Pay data
    const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
    
    if (!paymentToken) {
      return NextResponse.json(
        { error: 'Invalid payment token from Google Pay' },
        { status: 400 }
      );
    }

    // Parse the Stripe token from Google Pay
    let stripeToken;
    try {
      const tokenData = JSON.parse(paymentToken);
      stripeToken = tokenData.id;
    } catch (parseError) {
      console.error('Failed to parse Google Pay token:', parseError);
      return NextResponse.json(
        { error: 'Invalid payment token format' },
        { status: 400 }
      );
    }

    // Create or retrieve customer
    let customer;
    try {
      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerInfo.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customerInfo.email,
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          metadata: {
            planId,
            billing,
            company: customerInfo.company || '',
            paymentMethod: 'google_pay',
          },
        });
      }
    } catch (customerError) {
      console.error('Customer creation/retrieval error:', customerError);
      return NextResponse.json(
        { error: 'Failed to process customer information' },
        { status: 500 }
      );
    }

    // Create payment intent with Google Pay token
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      payment_method_data: {
        type: 'card',
        card: {
          token: stripeToken,
        },
      },
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        planId,
        billing,
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        company: customerInfo.company || '',
        paymentMethod: 'google_pay',
      },
      description: `UnionBolt AI ${planId} plan - ${billing} billing (Google Pay)`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
    });

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Payment successful - save to database
      const orderData = {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerInfo,
        planId,
        billing,
      };
      
      await saveOrderToDatabase(orderData);

      return NextResponse.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
        },
      });
    } else if (paymentIntent.status === 'requires_action') {
      // Additional authentication required
      return NextResponse.json({
        requiresAction: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      });
    } else {
      // Payment failed
      return NextResponse.json(
        { error: 'Payment failed or requires additional verification' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Google Pay processing error:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    } else if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid payment request' },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { 
          error: error.message || 'An error occurred while processing the Google Pay payment'
        },
        { status: 500 }
      );
    }
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}