import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isLocaleDomain: true,
      isReady: true,
      defaultLocale: 'en',
      domainLocales: [],
      isPreview: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID = 'mock_paypal_client_id';
process.env.PAYPAL_CLIENT_SECRET = 'mock_paypal_client_secret';
process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID = 'mock_merchant_id';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'mock_nextauth_secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock Stripe Elements
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => children,
  useStripe: () => ({
    createPaymentMethod: jest.fn(),
    confirmCardPayment: jest.fn(),
    createToken: jest.fn(),
  }),
  useElements: () => ({
    getElement: jest.fn(),
  }),
  CardElement: () => <div data-testid="card-element" />,
  CardNumberElement: () => <div data-testid="card-number-element" />,
  CardExpiryElement: () => <div data-testid="card-expiry-element" />,
  CardCvcElement: () => <div data-testid="card-cvc-element" />,
}));

// Mock PayPal SDK
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }) => children,
  PayPalButtons: () => <div data-testid="paypal-buttons" />,
  usePayPalScriptReducer: () => [{ isPending: false }, jest.fn()],
}));

// Mock Google Pay
jest.mock('@google-pay/button-react', () => ({
  GooglePayButton: () => <div data-testid="google-pay-button" />,
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  mockStripeResponse: (response) => {
    const stripe = require('@stripe/react-stripe-js');
    stripe.useStripe.mockReturnValue({
      createPaymentMethod: jest.fn().mockResolvedValue(response),
      confirmCardPayment: jest.fn().mockResolvedValue(response),
      createToken: jest.fn().mockResolvedValue(response),
    });
  },
  
  mockFetchResponse: (response, status = 200) => {
    global.fetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    });
  },
  
  createMockCustomerInfo: (overrides = {}) => ({
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    company: 'Test Union',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'US',
    ...overrides,
  }),
};

// Increase timeout for integration tests
jest.setTimeout(10000);