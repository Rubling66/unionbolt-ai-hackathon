import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

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

    // Validate amount
    if (amount < 1) {
      return NextResponse.json(
        { error: 'Amount too small' },
        { status: 400 }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to authenticate with PayPal' },
        { status: 500 }
      );
    }

    // Create PayPal order
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `${planId}_${Date.now()}`,
        description: `UnionBolt AI ${planId} plan - ${billing} billing`,
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency.toUpperCase(),
              value: amount.toFixed(2)
            }
          }
        },
        items: [{
          name: `UnionBolt AI ${planId} Plan`,
          description: `${billing} subscription to UnionBolt AI ${planId} plan`,
          unit_amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2)
          },
          quantity: '1',
          category: 'DIGITAL_GOODS'
        }]
      }],
      application_context: {
        brand_name: 'UnionBolt AI',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`
      },
      payer: {
        email_address: customerInfo.email,
        name: {
          given_name: customerInfo.firstName,
          surname: customerInfo.lastName
        }
      }
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `${planId}_${Date.now()}`,
      },
      body: JSON.stringify(orderData),
    });

    const order = await response.json();
    
    if (!response.ok) {
      console.error('PayPal order creation error:', order);
      return NextResponse.json(
        { error: 'Failed to create PayPal order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderID: order.id,
      status: order.status,
    });
  } catch (error: any) {
    console.error('PayPal create order error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'An error occurred while creating the PayPal order'
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