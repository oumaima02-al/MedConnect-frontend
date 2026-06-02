/* ── Stepper ──────────────────────────────────────────────────────── */
const STEPS = ['Informations', 'Documents', 'Confirmation'];

export default function Stepper({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
      {STEPS.map((label, idx) => {
        const done    = idx < current;
        const active  = idx === current;
        const color   = done || active ? '#2ecc71' : '#d1d5db';
        const textCol = done || active ? '#111827' : '#9ca3af';

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : undefined }}>
            {/* Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? '#2ecc71' : active ? 'linear-gradient(135deg,#2ecc71,#16a34a)' : '#f3f4f6',
                border: active ? 'none' : done ? 'none' : '2px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14,
                color: done || active ? 'white' : '#9ca3af',
                boxShadow: active ? '0 4px 14px rgba(46,204,113,0.4)' : 'none',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}>
                {done
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  : idx + 1
                }
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: active ? 600 : 500, color: textCol, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>

            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 8px', marginBottom: 22,
                background: done ? '#2ecc71' : '#e5e7eb',
                transition: 'background 0.4s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
