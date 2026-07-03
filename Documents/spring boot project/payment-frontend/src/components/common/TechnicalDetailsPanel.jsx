export default function TechnicalDetailsPanel({ data }) {
  const entries = Object.entries(data || {}).filter(([, value]) => value !== null && value !== undefined && value !== '');
  return <section className="technical-details-panel">
    <dl>{entries.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl>
  </section>;
}
