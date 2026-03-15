export default function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 256 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 8, height: 8,
              background: '#C8922A',
              borderRadius: '50%',
              animation: 'bounce 1s infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }`}</style>
    </div>
  )
}
