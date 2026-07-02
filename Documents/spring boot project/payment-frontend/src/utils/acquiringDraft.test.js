import test from 'node:test';
import assert from 'node:assert/strict';
import { acquiringDraftKey } from './acquiringDraft.js';
import { idempotencyHeaders } from './idempotency.js';

test('draft keys are isolated by user and merchant', () => {
  assert.notEqual(
    acquiringDraftKey('contract', 'alice', 10),
    acquiringDraftKey('contract', 'alice', 11)
  );
  assert.notEqual(
    acquiringDraftKey('contract', 'alice', 10),
    acquiringDraftKey('contract', 'bob', 10)
  );
});

test('idempotency key is sent as the expected HTTP header', () => {
  assert.deepEqual(idempotencyHeaders('key-123456789012'), {
    headers: { 'Idempotency-Key': 'key-123456789012' }
  });
});
