import { formatDecimal } from '../../utils/money';

export default function MoneyAmount({ value, currency, className = '' }) {
  return <span className={`money-amount ${className}`.trim()}>{formatDecimal(value)}{currency ? ` ${currency}` : ''}</span>;
}
