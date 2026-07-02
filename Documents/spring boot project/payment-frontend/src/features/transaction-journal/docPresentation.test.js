import test from 'node:test';
import assert from 'node:assert/strict';
import { getPostingStatusMeta, parseAddInfo, toExclusiveEndDate, toStartDate } from './docPresentation.js';

test('keeps equals signs inside ADD_INFO values', () => {
  assert.deepEqual(parseAddInfo('KEY=a=b;FLAG=Y;'), [
    { key: 'KEY', value: 'a=b' },
    { key: 'FLAG', value: 'Y' },
  ]);
});

test('turns an inclusive UI end date into an exclusive next day', () => {
  const result = new Date(toExclusiveEndDate('2026-07-02'));
  const local = new Date('2026-07-03T00:00:00');
  assert.equal(result.getTime(), local.getTime());
});

test('keeps the start date at local midnight', () => {
  assert.equal(
    new Date(toStartDate('2026-07-02')).getTime(),
    new Date('2026-07-02T00:00:00').getTime(),
  );
});

test('maps posting status codes to readable labels', () => {
  assert.deepEqual(getPostingStatusMeta('P'), {
    code: 'P',
    label: 'Đã hạch toán',
    displayLabel: 'Đã hạch toán (P)',
    optionLabel: 'Đã hạch toán (P)',
    className: 'posted',
  });
});

test('keeps unknown posting status codes visible', () => {
  assert.deepEqual(getPostingStatusMeta('Z'), {
    code: 'Z',
    label: 'Z',
    displayLabel: 'Z',
    optionLabel: 'Z',
    className: 'unknown',
  });
});
