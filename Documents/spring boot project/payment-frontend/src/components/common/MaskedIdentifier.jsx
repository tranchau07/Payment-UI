export default function MaskedIdentifier({ value, label }) {
  return <span className="masked-identifier" title={label || 'Định danh đã được áp dụng chính sách hiển thị'}>{value || '—'}</span>;
}
