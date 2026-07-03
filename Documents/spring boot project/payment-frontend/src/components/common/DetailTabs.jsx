export default function DetailTabs({ tabs, active, onChange }) {
  return <div className="detail-tabs" role="tablist">{tabs.map((tab) => (
    <button key={tab.id} type="button" role="tab" aria-selected={active === tab.id}
      className={active === tab.id ? 'active' : ''} onClick={() => onChange(tab.id)}>{tab.label}</button>
  ))}</div>;
}
