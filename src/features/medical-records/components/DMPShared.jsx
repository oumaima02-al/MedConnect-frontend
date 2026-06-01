import { useState } from 'react';
/* ─── Shared Design Tokens & Reusable Components for DMP ─── */

// ─── Icon primitive (extending AppLayout icons) ─────────────
export function Icon({ name, size = 18, color = 'currentColor', style = {} }) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: 1.8,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    style,
  };
  switch (name) {
    case 'alert-triangle': return <svg {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case 'pill':       return <svg {...p}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>;
    case 'activity':   return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case 'clipboard':  return <svg {...p}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/></svg>;
    case 'syringe':    return <svg {...p}><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>;
    case 'file-text':  return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
    case 'image':      return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
    case 'heart':      return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case 'shield':     return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'lock':       return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case 'eye':        return <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'log':        return <svg {...p}><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>;
    case 'x':          return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'plus':       return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'edit':       return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'trash':      return <svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
    case 'check':      return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'stop':       return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/></svg>;
    case 'download':   return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
    case 'calendar':   return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'chevron-down': return <svg {...p}><polyline points="6 9 12 15 18 9"/></svg>;
    case 'thermometer':return <svg {...p}><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>;
    case 'droplet':    return <svg {...p}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
    case 'git-commit': return <svg {...p}><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>;
    default: return null;
  }
}

// ─── Severity / Status Badge ──────────────────────────────────
const BADGE_COLORS = {
  MILD:      { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  MODERATE:  { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  SEVERE:    { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  ACTIVE:    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  INACTIVE:  { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  RESOLVED:  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  NORMAL:    { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  ABNORMAL:  { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  CRITICAL:  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  WARNING:   { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  COMPLETED: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  PENDING:   { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  OVERDUE:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  REVOKED:   { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  SUCCESS:   { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  FAILURE:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  READ:      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  READ_WRITE:{ bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
  FULL:      { bg: '#fdf4ff', text: '#a21caf', border: '#f0abfc' },
};

export function Badge({ label, variant }) {
  const c = BADGE_COLORS[variant] || BADGE_COLORS.INACTIVE;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      letterSpacing: '0.03em',
    }}>
      {label || variant}
    </span>
  );
}

// ─── Card Container ───────────────────────────────────────────
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'white', borderRadius: 18,
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Section Header (inside a card) ──────────────────────────
export function SectionHeader({ icon, title, count, onAdd, addLabel = 'Ajouter', color = '#2ecc71' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 24px', borderBottom: '1px solid #f3f4f6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={18} color={color} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#111827', margin: 0 }}>
            {title}
          </h3>
          {count !== undefined && (
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{count} élément{count !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
      {onAdd && (
        <button
          id={`btn-add-${title.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={onAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 10,
            background: color, color: 'white',
            border: 'none', cursor: 'pointer',
            fontSize: '0.82rem', fontWeight: 600,
            fontFamily: 'inherit',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Icon name="plus" size={15} color="white" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, message = 'Aucune donnée disponible', sub = '' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <Icon name={icon} size={26} color="#9ca3af" />
      </div>
      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, color: '#374151', marginBottom: 4 }}>{message}</p>
      {sub && <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>{sub}</p>}
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────
export function Skeleton({ rows = 3 }) {
  return (
    <div style={{ padding: '20px 24px' }}>
      <style>{`@keyframes dmp-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} style={{
          height: 56, borderRadius: 12, marginBottom: 10,
          background: 'linear-gradient(90deg,#f3f4f6 25%,#e9ecef 50%,#f3f4f6 75%)',
          backgroundSize: '200% 100%',
          animation: 'dmp-shimmer 1.4s infinite',
          opacity: 1 - i * 0.15,
        }} />
      ))}
    </div>
  );
}

// ─── Error Banner ──────────────────────────────────────────────
export function ErrorBanner({ message }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#fef2f2', border: '1px solid #fecaca',
      borderRadius: 12, padding: '14px 18px', margin: '12px 24px',
    }}>
      <Icon name="alert-triangle" size={18} color="#dc2626" />
      <p style={{ fontSize: '0.87rem', color: '#dc2626', fontWeight: 500 }}>{message}</p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: width,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'dmp-modal-in 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes dmp-modal-in { from{opacity:0;transform:scale(0.95) translateY(-10px)} to{opacity:1;transform:none} }`}</style>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
        }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#111827', margin: 0 }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            background: '#f3f4f6', border: 'none', borderRadius: 8,
            width: 30, height: 30, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={16} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────
export function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: '0.78rem',
        fontWeight: 600, color: '#374151',
        marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, type = 'text', required, id }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{
        width: '100%', padding: '10px 13px',
        border: '1.5px solid #e5e7eb', borderRadius: 10,
        fontSize: '0.88rem', outline: 'none',
        fontFamily: 'inherit', color: '#111827',
        background: '#fafafa', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
      }}
      onFocus={e => e.target.style.borderColor = '#2ecc71'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────
export function Textarea({ value, onChange, placeholder, rows = 3, id }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', padding: '10px 13px',
        border: '1.5px solid #e5e7eb', borderRadius: 10,
        fontSize: '0.88rem', outline: 'none', resize: 'vertical',
        fontFamily: 'inherit', color: '#111827',
        background: '#fafafa', boxSizing: 'border-box',
        transition: 'border-color 0.2s',
      }}
      onFocus={e => e.target.style.borderColor = '#2ecc71'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────
export function Select({ value, onChange, options, placeholder, id }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      style={{
        width: '100%', padding: '10px 13px',
        border: '1.5px solid #e5e7eb', borderRadius: 10,
        fontSize: '0.88rem', outline: 'none',
        fontFamily: 'inherit', color: '#111827',
        background: '#fafafa', boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── Submit Button ────────────────────────────────────────────
export function SubmitBtn({ label = 'Enregistrer', loading = false, color = '#2ecc71' }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', padding: '12px', borderRadius: 12,
      background: loading ? '#9ca3af' : color,
      color: 'white', border: 'none',
      fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'opacity 0.15s',
    }}>
      {loading ? 'En cours…' : label}
    </button>
  );
}

// ─── Action Button (icon only) ───────────────────────────────
export function ActionBtn({ icon, color = '#6b7280', onClick, title, id }) {
  return (
    <button
      id={id}
      title={title}
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: 6, borderRadius: 8, color,
        transition: 'background 0.15s',
        display: 'flex', alignItems: 'center',
      }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}18`}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <Icon name={icon} size={16} color={color} />
    </button>
  );
}

// ─── Info Row (label + value pair) ───────────────────────────
export function InfoRow({ label, value, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, ...style }}>
      <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, minWidth: 110 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.87rem', color: '#374151', fontWeight: 500 }}>
        {value || '—'}
      </span>
    </div>
  );
}

// ─── Format date ──────────────────────────────────────────────
export function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Tab Bar ──────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, flexWrap: 'wrap',
      background: '#f8fafc', borderRadius: 14, padding: 4,
      border: '1px solid #f3f4f6',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          id={`tab-${tab.key}`}
          onClick={() => onChange(tab.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 14px', borderRadius: 10, border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.83rem', fontWeight: 600,
            transition: 'all 0.18s',
            background: active === tab.key ? 'white' : 'transparent',
            color: active === tab.key ? '#111827' : '#6b7280',
            boxShadow: active === tab.key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <Icon name={tab.icon} size={15} color={active === tab.key ? tab.color || '#2ecc71' : '#9ca3af'} />
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              background: active === tab.key ? (tab.color || '#2ecc71') + '18' : '#f3f4f6',
              color: active === tab.key ? (tab.color || '#2ecc71') : '#9ca3af',
              padding: '1px 7px', borderRadius: 20,
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Data Table Row ───────────────────────────────────────────
export function DataRow({ children, hover = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 24px', borderBottom: '1px solid #f9fafb',
        background: hover && hovered ? '#fafafa' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

