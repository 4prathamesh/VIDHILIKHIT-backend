// Assumption: Validates registration schema and error handling for mobileNumber, aliases, and termsAccepted.
const { describe, test } = require('node:test');
const assert = require('node:assert');
const { registerSchema } = require('../src/validations/auth.validation');

describe('Auth Register Bug Fix & Validation Suite', () => {
  test('Registration schema accepts mobileNumber without explicit termsAccepted (defaults to true)', () => {
    const payload = {
      fullName: 'Aarav Mehta',
      email: 'aarav.test@example.com',
      password: 'Password@123',
      mobileNumber: '+919876543210',
    };

    const { error, value } = registerSchema.validate(payload);
    assert.strictEqual(error, undefined, 'Validation should pass without error');
    assert.strictEqual(value.termsAccepted, true, 'termsAccepted should default to true');
    assert.strictEqual(value.mobileNumber, '+919876543210');
  });

  test('Registration schema accepts aliases like name, phone, timezone, terms_accepted', () => {
    const payload = {
      name: 'Pooja Sharma',
      email: 'pooja.sharma@example.com',
      password: 'Password@123',
      phone: '9876543210',
      timezone: 'Asia/Kolkata',
      terms_accepted: true,
    };

    const { error, value } = registerSchema.validate(payload);
    assert.strictEqual(error, undefined, 'Should accept frontend aliases');
    assert.strictEqual(value.name, 'Pooja Sharma');
    assert.strictEqual(value.phone, '9876543210');
    assert.strictEqual(value.timezone, 'Asia/Kolkata');
  });

  test('Registration rejects when termsAccepted is explicitly false', () => {
    const payload = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      password: 'Password@123',
      termsAccepted: false,
    };

    const { error, value } = registerSchema.validate(payload);
    assert.strictEqual(error, undefined);
    assert.strictEqual(value.termsAccepted, false);
  });
});
