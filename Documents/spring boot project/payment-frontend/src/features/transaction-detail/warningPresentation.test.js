import test from 'node:test';
import assert from 'node:assert/strict';
import { presentWarning } from './warningPresentation.js';

const warning = {
  code: 'POSTING_DATE_BEFORE_TRANSACTION_DATE',
  message: 'Posting date precedes transaction date; verify Way4 business-date semantics',
  evidence: 'POSTING_DATE=2025-01-01 00:00:00.0, TRANS_DATE=2026-07-03 11:13:03.0'
};

test('localizes a Way4 date warning in Vietnamese', () => {
  const result = presentWarning(warning, 'vi', 'vi-VN');
  assert.equal(result.title, 'Ngày hạch toán trước ngày giao dịch');
  assert.match(result.message, /ngày nghiệp vụ/);
  assert.match(result.evidence, /Ngày hạch toán:/);
  assert.match(result.evidence, /Ngày giao dịch:/);
});

test('localizes a Way4 date warning in English', () => {
  const result = presentWarning(warning, 'en', 'en-US');
  assert.equal(result.title, 'Posting date precedes transaction date');
  assert.match(result.evidence, /Posting date:/);
  assert.match(result.evidence, /Transaction date:/);
});
