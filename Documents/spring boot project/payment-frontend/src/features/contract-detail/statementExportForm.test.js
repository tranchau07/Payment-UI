import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStatementExportParams, canExportStatement, STATEMENT_EXPORT_FORMATS } from './statementExportForm.js';

test('statement export form requires date range and format', () => {
  assert.equal(canExportStatement({ fromDate: '', toDate: '2026-07-09', format: 'XLSX' }), false);
  assert.equal(canExportStatement({ fromDate: '2026-07-01', toDate: '2026-07-09', format: 'PDF' }), true);
  assert.deepEqual(STATEMENT_EXPORT_FORMATS, ['XLSX', 'PDF', 'DOCX', 'CSV', 'JSON']);
});

test('statement export params preserve selected date range and posting-leg choice', () => {
  const params = buildStatementExportParams({ fromDate: '2026-07-01', toDate: '2026-07-09', includePostingLegs: true });
  assert.match(params.fromDate, /^2026-06-30T17:00:00|^2026-07-01T00:00:00/);
  assert.match(params.toDate, /^2026-07-09/);
  assert.equal(params.includePostingLegs, true);
});
