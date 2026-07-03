const WARNING_TEXT = {
  NON_ZERO_RETURN_CODE: {
    vi: ['Mã kết quả khác 0', 'Way4 trả về mã kết quả khác 0.'],
    en: ['Non-zero return code', 'Way4 returned a non-zero return code.']
  },
  NEGATIVE_DOCUMENT_AMOUNT: {
    vi: ['Số tiền chứng từ âm', 'Số tiền chứng từ là số âm; cần đối chiếu quy tắc của loại giao dịch.'],
    en: ['Negative document amount', 'The document amount is negative; validate the transaction-type rules.']
  },
  INACTIVE_AMENDMENT: {
    vi: ['Phiên bản không hiệu lực', 'Chứng từ không ở phiên bản hiệu lực.'],
    en: ['Inactive amendment', 'The document is not the active amendment.']
  },
  POSTED_WITHOUT_LEGS: {
    vi: ['Thiếu bút toán', 'Chứng từ đã hạch toán nhưng không tìm thấy bút toán trong M_TRANSACTION.'],
    en: ['Missing posting entries', 'The document is posted, but no entries were found in M_TRANSACTION.']
  },
  ACCOUNT_NOT_RESOLVED: {
    vi: ['Không xác định được tài khoản', 'Tài khoản của bút toán không tồn tại trong ACCOUNT.'],
    en: ['Account not resolved', 'A posting-entry account does not exist in ACCOUNT.']
  },
  CURRENCY_MISMATCH: {
    vi: ['Khác tiền tệ', 'Có bút toán sử dụng tiền tệ khác; đây có thể là bút toán ngoại hối hoặc bút toán nội bộ hợp lệ.'],
    en: ['Currency mismatch', 'A posting entry uses a different currency; this may be a valid FX or internal entry.']
  },
  POSTING_DATE_BEFORE_TRANSACTION_DATE: {
    vi: ['Ngày hạch toán trước ngày giao dịch', 'Ngày hạch toán trước ngày giao dịch; cần đối chiếu quy tắc ngày nghiệp vụ của Way4.'],
    en: ['Posting date precedes transaction date', 'The posting date precedes the transaction date; verify the Way4 business-date rules.']
  }
};

const FIELD_LABELS = {
  vi: { RETURN_CODE: 'Mã kết quả', TRANS_AMOUNT: 'Số tiền giao dịch', AMND_STATE: 'Trạng thái hiệu lực', 'DOC.ID': 'Mã chứng từ', POSTING_DATE: 'Ngày hạch toán', TRANS_DATE: 'Ngày giao dịch' },
  en: { RETURN_CODE: 'Return code', TRANS_AMOUNT: 'Transaction amount', AMND_STATE: 'Amendment state', 'DOC.ID': 'Document ID', POSTING_DATE: 'Posting date', TRANS_DATE: 'Transaction date' }
};

const parseWay4Date = (value) => {
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
};

const localizeEvidence = (evidence, language, locale) => {
  if (!evidence) return '';
  if (evidence === 'LEFT JOIN returned no account') return language === 'en' ? 'No matching ACCOUNT record' : 'Không tìm thấy bản ghi ACCOUNT tương ứng';
  if (evidence === 'Review DOC and leg currencies') return language === 'en' ? 'Compare DOC and posting-entry currencies' : 'Đối chiếu tiền tệ của DOC và bút toán';

  const parts = evidence.split(/,\s+(?=[A-Z_.]+\s*=)/);
  if (!parts.every((part) => part.includes('='))) return evidence;
  return parts.map((part) => {
    const separator = part.indexOf('=');
    const key = part.slice(0, separator).trim();
    const rawValue = part.slice(separator + 1).trim();
    const parsedDate = key.endsWith('_DATE') ? parseWay4Date(rawValue) : null;
    const value = parsedDate ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' }).format(parsedDate) : rawValue;
    return `${FIELD_LABELS[language]?.[key] || key}: ${value}`;
  }).join(' · ');
};

export const presentWarning = (warning, language = 'vi', locale = 'vi-VN') => {
  const text = WARNING_TEXT[warning.code]?.[language];
  return {
    title: text?.[0] || warning.code,
    message: text?.[1] || warning.message,
    evidence: localizeEvidence(warning.evidence, language, locale)
  };
};
