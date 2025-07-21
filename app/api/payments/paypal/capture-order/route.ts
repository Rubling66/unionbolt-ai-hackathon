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

// Save order to database (mock implementation)
async function saveOrderToDatabase(orderData: any) {
  // In a real application, you would save this to your database
  console.log('Saving order to database:', {
    orderId: orderData.id,
    status: orderData.status,
    amount: orderData.purchase_units[0]?.amount?.value,
    currency: orderData.purchase_units[0]?.amount?.currency_code,
    customerEmail: orderData.payer?.email_address,
    customerName: `${orderData.payer?.name?.given_name} ${orderData.payer?.name?.surname}`,
    planId: orderData.planId,
    paymentMethod: 'paypal',
    createdAt: new Date().toISOString(),
  });
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { orderID, planId, customerInfo } = await request.json();

    // Validate required fields
    if (!orderID || !planId || !customerInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Capture the PayPal order
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `capture_${orderID}_${Date.now()}`,
      },
    });

    const captureData = await response.json();
    
    if (!response.ok) {
      console.error('PayPal capture error:', captureData);
      return NextResponse.json(
        { error: 'Failed to capture PayPal payment' },
        { status: 500 }
      );
    }

    // Check if payment was successful
    const captureStatus = captureData.purchase_units[0]?.payments?.captures[0]?.status;
    
    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment was not completed successfully' },
        { status: 400 }
      );
    }

    // Save order to database
    const orderData = {
      ...captureData,
      planId,
      customerInfo,
    };
    
    await saveOrderToDatabase(orderData);

    // Return success response
    return NextResponse.json({
      success: true,
      orderID: captureData.id,
      status: captureData.status,
      captureID: captureData.purchase_units[0]?.payments?.captures[0]?.id,
      amount: captureData.purchase_units[0]?.amount?.value,
      currency: captureData.purchase_units[0]?.amount?.currency_code,
      payer: {
        email: captureData.payer?.email_address,
        name: `${captureData.payer?.name?.given_name} ${captureData.payer?.name?.surname}`,
        payerId: captureData.payer?.payer_id,
      },
    });
  } catch (error: any) {
    console.error('PayPal capture order error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'An error occurred while capturing the PayPal payment'
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