import { useState } from 'react';

// ─── Color palette (teal/emerald medical theme) ───────────────
export const COLORS = {
  primary:   '#2ecc71', // MedConnect Emerald
  secondary: '#16a34a', // Darker Green
  accent:    '#3498db', // Medical Blue
  danger:    '#e74c3c',
  warn:      '#f1c40f',
  muted:     '#94a3b8',
  surface:   '#ffffff',
  bg:        '#f8fafc',
  border:    '#e2e8f0',
};

// ─── Icons ────────────────────────────────────────────────────
export function ApptIcon({ name, size = 18, color = 'currentColor' }) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: 1.5,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'calendar':     return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case 'calendar-plus':return <svg {...p}><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M16 2v4M8 2v4M3 10h18M16 19h6M19 16v6"/></svg>;
    case 'clock':        return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    case 'user':         return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'stethoscope':  return <svg {...p}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>;
    case 'video':        return <svg {...p}><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>;
    case 'phone':        return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case 'map-pin':      return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'check':        return <svg {...p}><path d="M20 6 9 17l-5-5"/></svg>;
    case 'check-circle': return <svg {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>;
    case 'x':            return <svg {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>;
    case 'x-circle':     return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>;
    case 'plus':         return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'edit':         return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'trash':        return <svg {...p}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>;
    case 'refresh':      return <svg {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;
    case 'alert':        return <svg {...p}><path d="m12 5 9 14H3l9-14zM12 9v4M12 17h.01"/></svg>;
    case 'list':         return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case 'queue':        return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'star':         return <svg {...p}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
    case 'info':         return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
    case 'schedule':     return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>;
    case 'wait':         return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2M16.24 7.76l1.41-1.41M19.07 4.93l-1.41 1.41M7.76 16.24l-1.41 1.41"/></svg>;
    case 'arrow-left':   return <svg {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
    case 'filter':       return <svg {...p}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>;
    case 'search':       return <svg {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
    case 'message':      return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    default: return null;
  }
}

// ─── Status badge ─────────────────────────────────────────────
const STATUS_CONFIG = {
  SCHEDULED:  { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', label: 'Planifié' },
  CONFIRMED:  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', label: 'Confirmé' },
  CANCELLED:  { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3', label: 'Annulé' },
  COMPLETED:  { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', label: 'Terminé' },
  NO_SHOW:    { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: 'Absent' },
};

const TYPE_CONFIG = {
  IN_PERSON:  { label: 'En cabinet', icon: 'map-pin',    color: '#2ecc71' },
  VIDEO:      { label: 'Vidéo',      icon: 'video',      color: '#3498db' },
  PHONE:      { label: 'Téléphone',  icon: 'phone',      color: '#94a3b8' },
};

export function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}

export function TypeBadge({ type }) {
  const c = TYPE_CONFIG[type] || { label: type, icon: 'calendar', color: '#9ca3af' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.78rem', fontWeight: 600, color: c.color,
    }}>
      <ApptIcon name={c.icon} size={13} color={c.color} />
      {c.label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, style = {}, onClick, hover = true }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white', borderRadius: 16,
        border: '1px solid #f0f4f8',
        boxShadow: '0 1px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...style,
      }}
      onMouseEnter={hover && onClick ? e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(14,165,233,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; } : undefined}
      onMouseLeave={hover && onClick ? e => { e.currentTarget.style.boxShadow = '0 1px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; } : undefined}
    >
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────
export function SectionHeader({ icon, title, count, onAdd, addLabel = 'Ajouter', color = COLORS.primary, extra }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f0f4f8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ApptIcon name={icon} size={19} color={color} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#111827', margin: 0 }}>{title}</h3>
          {count !== undefined && <span style={{ fontSize: '0.73rem', color: '#9ca3af' }}>{count} élément{count !== 1 ? 's' : ''}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {extra}
        {onAdd && (
          <button id={`btn-add-${title.toLowerCase().replace(/\s+/g, '-')}`} onClick={onAdd}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: color, color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <ApptIcon name="plus" size={14} color="white" />{addLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────
export function EmptyState({ icon, title, sub = '', action, actionLabel }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 24px' }}>
      <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 4px 16px rgba(14,165,233,0.1)' }}>
        <ApptIcon name={icon} size={30} color="#0ea5e9" />
      </div>
      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#111827', marginBottom: 6, fontSize: '1rem' }}>{title}</p>
      {sub && <p style={{ fontSize: '0.84rem', color: '#9ca3af', marginBottom: 20 }}>{sub}</p>}
      {action && (
        <button onClick={action}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: COLORS.primary, color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, fontFamily: 'inherit' }}
        >
          <ApptIcon name="plus" size={14} color="white" />{actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────
export function Skeleton({ rows = 3, height = 80 }) {
  return (
    <div style={{ padding: '16px 24px' }}>
      <style>{`@keyframes appt-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} style={{ height, borderRadius: 14, marginBottom: 12, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'appt-shimmer 1.4s infinite', opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────
export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', margin: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ApptIcon name="alert" size={17} color="#dc2626" />
        <p style={{ fontSize: '0.87rem', color: '#dc2626', fontWeight: 500, margin: 0 }}>{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
          Réessayer
        </button>
      )}
    </div>
  );
}

// ─── Success banner ───────────────────────────────────────────
export function SuccessBanner({ message }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', margin: '12px 0' }}>
      <ApptIcon name="check-circle" size={17} color="#16a34a" />
      <p style={{ fontSize: '0.87rem', color: '#16a34a', fontWeight: 500, margin: 0 }}>{message}</p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 520, icon }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 22, width: '100%', maxWidth: width, boxShadow: '0 24px 72px rgba(0,0,0,0.18)', maxHeight: '92vh', overflowY: 'auto', animation: 'appt-modal-in 0.22s ease' }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes appt-modal-in { from{opacity:0;transform:scale(0.96) translateY(-12px)} to{opacity:1;transform:none} }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f0f4f8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon && <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ApptIcon name={icon} size={18} color={COLORS.primary} /></div>}
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#111827', margin: 0 }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ApptIcon name="x" size={16} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: '22px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────
export function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

const inputBase = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10,
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', color: '#111827',
  background: '#fafbfc', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
};

export function Input({ value, onChange, placeholder, type = 'text', required, id, min, max, readOnly }) {
  return (
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
      required={required} min={min} max={max} readOnly={readOnly}
      style={{ ...inputBase, background: readOnly ? '#f8fafc' : '#fafbfc' }}
      onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

export function Textarea({ value, onChange, placeholder, rows = 3, id }) {
  return (
    <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{ ...inputBase, resize: 'vertical' }}
      onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

export function Select({ value, onChange, options, placeholder, id, disabled }) {
  return (
    <select id={id} value={value} onChange={onChange} disabled={disabled}
      style={{ ...inputBase, cursor: disabled ? 'not-allowed' : 'pointer', background: disabled ? '#f8fafc' : '#fafbfc' }}
      onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'; }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function SubmitBtn({ label = 'Enregistrer', loading = false, color = COLORS.primary, icon, type = 'submit', onClick }) {
  return (
    <button type={type} onClick={onClick} disabled={loading}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '12px', borderRadius: 12, background: loading ? '#d1d5db' : color, color: 'white', border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s', marginTop: 4 }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {loading ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : icon && <ApptIcon name={icon} size={15} color="white" />}
      {loading ? 'En cours…' : label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

export function ActionBtn({ icon, color = '#6b7280', onClick, title, id, label }) {
  return (
    <button id={id} title={title} onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: label ? '6px 12px' : 6, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.15s', fontSize: '0.8rem', fontWeight: 600, color, fontFamily: 'inherit' }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}18`}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <ApptIcon name={icon} size={15} color={color} />
      {label && <span>{label}</span>}
    </button>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', background: '#f1f5f9', borderRadius: 14, padding: 4 }}>
      {tabs.map(tab => (
        <button key={tab.key} id={`tab-appt-${tab.key}`} onClick={() => onChange(tab.key)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 600, transition: 'all 0.18s', background: active === tab.key ? 'white' : 'transparent', color: active === tab.key ? '#111827' : '#6b7280', boxShadow: active === tab.key ? '0 1px 8px rgba(0,0,0,0.08)' : 'none' }}
        >
          <ApptIcon name={tab.icon} size={15} color={active === tab.key ? (tab.color || COLORS.primary) : '#9ca3af'} />
          {tab.label}
          {tab.badge > 0 && <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#ef4444', color: 'white', padding: '1px 6px', borderRadius: 20 }}>{tab.badge}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── Star rating ──────────────────────────────────────────────
export function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => !readOnly && onChange && onChange(n)}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{ background: 'none', border: 'none', cursor: readOnly ? 'default' : 'pointer', padding: 2, transition: 'transform 0.1s', transform: hovered === n ? 'scale(1.2)' : 'scale(1)' }}
        >
          <ApptIcon name="star" size={22} color={(hovered || value) >= n ? '#f59e0b' : '#d1d5db'}
            style={{ fill: (hovered || value) >= n ? '#f59e0b' : 'none' }} />
        </button>
      ))}
    </div>
  );
}

// ─── Utility helpers ──────────────────────────────────────────
export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export { STATUS_CONFIG, TYPE_CONFIG };
