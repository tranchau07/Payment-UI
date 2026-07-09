export const STATEMENT_EXPORT_FORMATS = ['XLSX', 'PDF', 'DOCX', 'CSV', 'JSON'];

export const initialStatementExportForm = () => ({
  fromDate: '',
  toDate: '',
  format: 'XLSX',
  includePostingLegs: false,
});

export const canExportStatement = (form) => Boolean(form?.fromDate && form?.toDate && form?.format);

export const buildStatementExportParams = (form) => ({
  fromDate: new Date(`${form.fromDate}T00:00:00`).toISOString(),
  toDate: new Date(`${form.toDate}T23:59:59`).toISOString(),
  includePostingLegs: Boolean(form.includePostingLegs),
});
