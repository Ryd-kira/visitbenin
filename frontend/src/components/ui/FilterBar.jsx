export default function FilterBar({ filters, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {filters.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            border: `1px solid ${active === f.value ? '#C8922A' : 'rgba(200,146,42,0.2)'}`,
            background: active === f.value ? '#C8922A' : 'white',
            color: active === f.value ? '#0E0A06' : '#3D2B10',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {f.icon && <span style={{ marginRight: 6 }}>{f.icon}</span>}
          {f.label}
        </button>
      ))}
    </div>
  )
}
