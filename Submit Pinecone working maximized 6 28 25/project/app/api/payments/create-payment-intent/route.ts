import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, planId, billing, customerInfo } = await request.json();

    // Validate required fields
    if (!amount || !currency || !planId || !customerInfo) {
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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      customer: customer.id,
      metadata: {
        planId,
        billing,
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        company: customerInfo.company || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `UnionBolt AI ${planId} plan - ${billing} billing`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'An error occurred while creating the payment intent'
      },
      { status: 500 }
    );
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