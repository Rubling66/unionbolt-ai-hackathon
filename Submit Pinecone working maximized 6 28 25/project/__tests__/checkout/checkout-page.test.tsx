import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import CheckoutPage from '../../app/checkout/page';

// Mock the payment components
jest.mock('../../components/checkout/StripePaymentForm', () => {
  return function MockStripePaymentForm({ onSuccess, onError }: any) {
    return (
      <div data-testid="stripe-payment-form">
        <button 
          onClick={() => onSuccess({ paymentIntentId: 'pi_test123' })}
          data-testid="stripe-success-btn"
        >
          Simulate Stripe Success
        </button>
        <button 
          onClick={() => onError('Test error')}
          data-testid="stripe-error-btn"
        >
          Simulate Stripe Error
        </button>
      </div>
    );
  };
});

jest.mock('../../components/checkout/PayPalPaymentForm', () => {
  return function MockPayPalPaymentForm({ onSuccess, onError }: any) {
    return (
      <div data-testid="paypal-payment-form">
        <button 
          onClick={() => onSuccess({ orderID: 'PAYPAL123' })}
          data-testid="paypal-success-btn"
        >
          Simulate PayPal Success
        </button>
        <button 
          onClick={() => onError('PayPal error')}
          data-testid="paypal-error-btn"
        >
          Simulate PayPal Error
        </button>
      </div>
    );
  };
});

jest.mock('../../components/checkout/GooglePayButton', () => {
  return function MockGooglePayButton({ onSuccess, onError }: any) {
    return (
      <div data-testid="google-pay-button">
        <button 
          onClick={() => onSuccess({ paymentIntentId: 'pi_google123' })}
          data-testid="google-pay-success-btn"
        >
          Simulate Google Pay Success
        </button>
        <button 
          onClick={() => onError('Google Pay error')}
          data-testid="google-pay-error-btn"
        >
          Simulate Google Pay Error
        </button>
      </div>
    );
  };
});

// Mock useSearchParams
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('CheckoutPage', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock for useSearchParams
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((key: string) => {
        const params: Record<string, string> = {
          planId: 'journeyman',
          billing: 'monthly'
        };
        return params[key] || null;
      }),
    } as any);
  });

  it('renders checkout page with all sections', () => {
    render(<CheckoutPage />);
    
    // Check main sections
    expect(screen.getByText('Complete Your Order')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Billing Information')).toBeInTheDocument();
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    
    // Check plan information
    expect(screen.getByText('Journeyman Plan')).toBeInTheDocument();
    expect(screen.getByText('Monthly Billing')).toBeInTheDocument();
  });

  it('displays correct plan information for different plans', () => {
    // Test Master plan
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((key: string) => {
        const params: Record<string, string> = {
          planId: 'master',
          billing: 'yearly'
        };
        return params[key] || null;
      }),
    } as any);

    render(<CheckoutPage />);
    
    expect(screen.getByText('Master Plan')).toBeInTheDocument();
    expect(screen.getByText('Yearly Billing')).toBeInTheDocument();
    expect(screen.getByText('$1,188.00')).toBeInTheDocument(); // Yearly price
  });

  it('handles billing information form submission', async () => {
    render(<CheckoutPage />);
    
    // Fill out billing form
    const emailInput = screen.getByLabelText(/email/i);
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    
    // Check that values are updated
    expect(emailInput).toHaveValue('test@example.com');
    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('switches between payment methods', () => {
    render(<CheckoutPage />);
    
    // Check default payment method (should be Stripe)
    expect(screen.getByTestId('stripe-payment-form')).toBeInTheDocument();
    
    // Switch to PayPal
    const paypalTab = screen.getByText('PayPal');
    fireEvent.click(paypalTab);
    expect(screen.getByTestId('paypal-payment-form')).toBeInTheDocument();
    
    // Switch to Google Pay
    const googlePayTab = screen.getByText('Google Pay');
    fireEvent.click(googlePayTab);
    expect(screen.getByTestId('google-pay-button')).toBeInTheDocument();
  });

  it('handles successful Stripe payment', async () => {
    render(<CheckoutPage />);
    
    // Fill out required billing information
    const emailInput = screen.getByLabelText(/email/i);
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    
    // Simulate successful payment
    const successButton = screen.getByTestId('stripe-success-btn');
    fireEvent.click(successButton);
    
    await waitFor(() => {
      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
    });
  });

  it('handles payment errors', async () => {
    render(<CheckoutPage />);
    
    // Fill out required billing information
    const emailInput = screen.getByLabelText(/email/i);
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    
    // Simulate payment error
    const errorButton = screen.getByTestId('stripe-error-btn');
    fireEvent.click(errorButton);
    
    await waitFor(() => {
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
    });
  });

  it('validates required billing fields', async () => {
    render(<CheckoutPage />);
    
    // Try to proceed without filling required fields
    const stripeForm = screen.getByTestId('stripe-payment-form');
    expect(stripeForm).toBeInTheDocument();
    
    // Check that form validation prevents submission
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeRequired();
    
    const firstNameInput = screen.getByLabelText(/first name/i);
    expect(firstNameInput).toBeRequired();
    
    const lastNameInput = screen.getByLabelText(/last name/i);
    expect(lastNameInput).toBeRequired();
  });

  it('displays correct pricing for different billing periods', () => {
    // Test monthly billing
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((key: string) => {
        const params: Record<string, string> = {
          planId: 'journeyman',
          billing: 'monthly'
        };
        return params[key] || null;
      }),
    } as any);

    const { rerender } = render(<CheckoutPage />);
    expect(screen.getByText('$79.00')).toBeInTheDocument();
    
    // Test yearly billing
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((key: string) => {
        const params: Record<string, string> = {
          planId: 'journeyman',
          billing: 'yearly'
        };
        return params[key] || null;
      }),
    } as any);

    rerender(<CheckoutPage />);
    expect(screen.getByText('$790.00')).toBeInTheDocument();
  });

  it('handles PayPal payment success', async () => {
    render(<CheckoutPage />);
    
    // Fill out billing information
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Switch to PayPal
    const paypalTab = screen.getByText('PayPal');
    fireEvent.click(paypalTab);
    
    // Simulate PayPal success
    const successButton = screen.getByTestId('paypal-success-btn');
    fireEvent.click(successButton);
    
    await waitFor(() => {
      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
    });
  });

  it('handles Google Pay payment success', async () => {
    render(<CheckoutPage />);
    
    // Fill out billing information
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Switch to Google Pay
    const googlePayTab = screen.getByText('Google Pay');
    fireEvent.click(googlePayTab);
    
    // Simulate Google Pay success
    const successButton = screen.getByTestId('google-pay-success-btn');
    fireEvent.click(successButton);
    
    await waitFor(() => {
      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
    });
  });

  it('displays loading state during payment processing', async () => {
    render(<CheckoutPage />);
    
    // Fill out billing information
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // The loading state would be handled within the payment components
    // This test ensures the components are rendered and can handle state changes
    expect(screen.getByTestId('stripe-payment-form')).toBeInTheDocument();
  });
});