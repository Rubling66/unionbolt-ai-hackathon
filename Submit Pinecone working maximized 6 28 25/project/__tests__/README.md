# Payment System Testing Documentation

This directory contains comprehensive tests for the checkout payment system, covering Stripe, PayPal, and Google Pay integrations.

## Test Structure

```
__tests__/
├── checkout/
│   ├── payment-integration.test.ts    # Backend API integration tests
│   └── checkout-page.test.tsx         # Frontend component tests
├── e2e/
│   └── payment-flow.test.ts          # End-to-end payment flow tests
└── README.md                         # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI/CD Pipeline
```bash
npm run test:ci
```

## Test Categories

### 1. Payment Integration Tests (`payment-integration.test.ts`)

Tests the backend API routes for payment processing:

- **Stripe Payment Intent Creation**
  - Successful payment intent creation
  - Error handling for missing fields
  - Amount validation
  - Customer creation/retrieval

- **PayPal Order Management**
  - Order creation with proper authentication
  - Order capture and completion
  - Error handling for authentication failures

- **Google Pay Processing**
  - Token validation and processing
  - Integration with Stripe backend
  - Error handling for invalid tokens

- **Data Validation**
  - Email format validation
  - Required field validation
  - Plan ID and billing period validation

### 2. Checkout Page Tests (`checkout-page.test.tsx`)

Tests the frontend checkout page components:

- **Page Rendering**
  - All sections display correctly
  - Plan information shows properly
  - Payment method tabs work

- **Form Interactions**
  - Billing information form submission
  - Field validation
  - Payment method switching

- **Payment Processing**
  - Success scenarios for all payment methods
  - Error handling and display
  - Loading states

### 3. End-to-End Tests (`payment-flow.test.ts`)

Tests complete user journeys:

- **Complete Checkout Flow**
  - Navigation to checkout
  - Form completion
  - Payment processing
  - Success confirmation

- **Error Scenarios**
  - Payment failures
  - Network errors
  - Validation errors

- **Security Testing**
  - Input sanitization
  - Amount validation
  - Concurrent payment handling

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following test variables:

```env
# Stripe Test Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_SECRET_KEY=sk_test_your_test_key

# PayPal Test Credentials
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_test_client_id
PAYPAL_CLIENT_SECRET=your_test_client_secret

# Google Pay Test Configuration
NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID=your_test_merchant_id

# Application Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET=your_test_secret
NEXTAUTH_URL=http://localhost:3000
```

### Test Data

The tests use the following test data:

#### Test Plans
- **Apprentice**: $29/month, $290/year
- **Journeyman**: $79/month, $790/year  
- **Master**: $99/month, $1,188/year

#### Test Customer Information
```javascript
{
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Test Union',
  address: '123 Test Street',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  country: 'US'
}
```

#### Test Payment Methods
- **Stripe**: Uses test card tokens
- **PayPal**: Uses sandbox environment
- **Google Pay**: Uses test merchant configuration

## Mock Configuration

The tests use comprehensive mocking for:

- **Payment Gateways**: All payment providers are mocked to avoid real transactions
- **Next.js Router**: Navigation and routing functionality
- **Environment Variables**: Test-specific configuration
- **Network Requests**: Controlled responses for API calls

## Coverage Goals

The test suite aims for:
- **70%+ Line Coverage**: Ensuring most code paths are tested
- **70%+ Branch Coverage**: Testing different conditional paths
- **70%+ Function Coverage**: All major functions are tested
- **70%+ Statement Coverage**: Most statements are executed

## Best Practices

### Writing New Tests

1. **Descriptive Test Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **Mock External Dependencies**: Always mock payment providers and external APIs
4. **Test Edge Cases**: Include tests for error conditions and edge cases
5. **Keep Tests Isolated**: Each test should be independent and not rely on others

### Test Data Management

1. **Use Factories**: Create helper functions for generating test data
2. **Avoid Hard-coding**: Use constants for test values that might change
3. **Clean Up**: Ensure tests clean up after themselves

### Error Testing

1. **Test All Error Paths**: Include tests for various failure scenarios
2. **Verify Error Messages**: Ensure error messages are user-friendly
3. **Test Recovery**: Verify the system can recover from errors

## Debugging Tests

### Common Issues

1. **Environment Variables**: Ensure all required env vars are set
2. **Mock Configuration**: Verify mocks are properly configured
3. **Async Operations**: Use proper async/await patterns
4. **Component Mounting**: Ensure components are properly rendered

### Debug Commands

```bash
# Run specific test file
npm test payment-integration.test.ts

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

- **Fast Execution**: Tests are optimized for quick execution
- **Reliable**: Mocked dependencies ensure consistent results
- **Comprehensive**: Covers all critical payment flows
- **Reporting**: Generates coverage reports for monitoring

## Security Considerations

- **No Real Payments**: All tests use mock data and sandbox environments
- **Sensitive Data**: No real API keys or customer data in tests
- **Input Validation**: Tests verify proper input sanitization
- **Error Handling**: Tests ensure sensitive information isn't leaked in errors

## Contributing

When adding new payment features:

1. Add corresponding tests for new functionality
2. Update existing tests if behavior changes
3. Ensure all tests pass before submitting
4. Add documentation for new test scenarios
5. Maintain or improve coverage percentages

## Support

For questions about the testing setup:

1. Check this documentation first
2. Review existing test examples
3. Consult the Jest and Testing Library documentation
4. Ask team members for guidance on complex scenarios