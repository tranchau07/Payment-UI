import test from 'node:test';
import assert from 'node:assert/strict';
import { createPaginationItems } from './pagination.js';

test('shows every page for a short result set', () => {
  assert.deepEqual(createPaginationItems(1, 4), [0, 1, 2, 3]);
});

test('keeps first, last and nearby pages for a long result set', () => {
  assert.deepEqual(createPaginationItems(5, 12), [0, 'gap-4', 4, 5, 6, 'gap-11', 11]);
});
