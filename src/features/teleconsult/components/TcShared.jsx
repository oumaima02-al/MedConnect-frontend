import { useState } from 'react';

// ─── Color tokens ─────────────────────────────────────────────
export const TC = {
  primary:   '#6366f1', // indigo
  success:   '#10b981', // emerald
  danger:    '#ef4444',
  warn:      '#f59e0b',
  muted:     '#9ca3af',
  dark:      '#0f172a',
  surface:   '#ffffff',
  surfaceDark: '#1e293b',
  border:    '#e2e8f0',
  glow:      'rgba(99,102,241,0.18)',
};

// ─── Icons ────────────────────────────────────────────────────
export function TcIcon({ name, size = 18, color = 'currentColor' }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'video':       return <svg {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
    case 'video-off':   return <svg {...p}><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
    case 'mic':         return <svg {...p}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
    case 'mic-off':     return <svg {...p}><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
    case 'phone-off':   return <svg {...p}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 3.07 8.63 2 2 0 0 1 5.07 6.5h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11z"/><line x1="23" y1="1" x2="1" y2="23"/></svg>;
    case 'monitor':     return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case 'monitor-off': return <svg {...p}><path d="M17 17H4a2 2 0 0 1-2-2V5c0-1.5 1-2 1-2"/><path d="M22 15V5a2 2 0 0 0-2-2H9"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
    case 'record':      return <svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill={color} stroke="none"/></svg>;
    case 'record-stop': return <svg {...p}><circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6" fill={color} stroke="none"/></svg>;
    case 'message':     return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case 'send':        return <svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
    case 'user':        return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'users':       return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'clock':       return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case 'link':        return <svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
    case 'copy':        return <svg {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
    case 'check':       return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'check-circle':return <svg {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case 'x':           return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'alert':       return <svg {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    case 'plus':        return <svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'image':       return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
    case 'shield':      return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case 'calendar':    return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'info':        return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
    case 'refresh':     return <svg {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
    case 'arrow-right': return <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case 'stethoscope': return <svg {...p}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>;
    default: return null;
  }
}

// ─── Session Status Badge ─────────────────────────────────────
const STATUS_MAP = {
  CREATED:     { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Créée',       dot: '#3b82f6' },
  WAITING:     { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: 'En attente',  dot: '#f59e0b' },
  ACTIVE:      { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', label: 'En cours',    dot: '#22c55e' },
  ENDED:       { bg: '#f3f4f6', text: '#374151', border: '#d1d5db', label: 'Terminée',    dot: '#6b7280' },
  FORCE_ENDED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Interrompue', dot: '#ef4444' },
};

export function SessionBadge({ status }) {
  const c = STATUS_MAP[status] || STATUS_MAP.CREATED;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'inline-block', ...(status === 'ACTIVE' ? { animation: 'tc-pulse 1.2s infinite' } : {}) }} />
      {c.label}
      <style>{`@keyframes tc-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, style = {}, dark = false, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: dark ? TC.surfaceDark : TC.surface,
      borderRadius: 18, border: `1px solid ${dark ? '#334155' : TC.border}`,
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 0.2s, transform 0.2s',
      ...style,
    }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; } : undefined}
    >
      {children}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, icon, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 22, width: '100%', maxWidth: width, boxShadow: '0 24px 72px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto', animation: 'tc-modal 0.22s ease' }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes tc-modal { from{opacity:0;transform:scale(0.96) translateY(-12px)} to{opacity:1;transform:none} }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${TC.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon && <div style={{ width: 36, height: 36, borderRadius: 10, background: `${TC.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TcIcon name={icon} size={18} color={TC.primary} /></div>}
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#111827', margin: 0 }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TcIcon name="x" size={16} color="#6b7280" />
          </button>
        </div>
        <div style={{ padding: '22px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
export function Skeleton({ rows = 3, height = 72 }) {
  return (
    <div style={{ padding: '16px 24px' }}>
      <style>{`@keyframes tc-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} style={{ height, borderRadius: 14, marginBottom: 12, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'tc-shimmer 1.4s infinite', opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  );
}

// ─── Error & Success banners ──────────────────────────────────
export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TcIcon name="alert" size={16} color="#dc2626" />
        <span style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 500 }}>{message}</span>
      </div>
      {onRetry && <button onClick={onRetry} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 7, padding: '3px 10px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>Réessayer</button>}
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
      <TcIcon name="check-circle" size={16} color="#16a34a" />
      <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 500 }}>{message}</span>
    </div>
  );
}

// ─── Form field ────────────────────────────────────────────────
export function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

const inputBase = { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', color: '#111827', background: '#fafbfc', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };

export function Input({ value, onChange, placeholder, type = 'text', required, id }) {
  return (
    <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      style={inputBase}
      onFocus={e => { e.target.style.borderColor = TC.primary; e.target.style.boxShadow = `0 0 0 3px ${TC.glow}`; }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

export function SubmitBtn({ label = 'Valider', loading = false, color = TC.primary, icon, type = 'submit', onClick, disabled }) {
  return (
    <button type={type} onClick={onClick} disabled={loading || disabled}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '12px', borderRadius: 12, background: loading || disabled ? '#d1d5db' : color, color: 'white', border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', cursor: loading || disabled ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s', marginTop: 4 }}
      onMouseEnter={e => { if (!loading && !disabled) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {loading
        ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
        : icon && <TcIcon name={icon} size={15} color="white" />
      }
      {loading ? 'En cours…' : label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

// ─── Stat card ────────────────────────────────────────────────
export function StatCard({ icon, label, value, color = TC.primary, sub }) {
  return (
    <Card style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TcIcon name={icon} size={22} color={color} />
        </div>
        <div>
          <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#111827', margin: 0 }}>{value}</p>
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>{label}</p>
          {sub && <p style={{ fontSize: '0.72rem', color, fontWeight: 600, margin: 0 }}>{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

// ─── Control button (used in video room) ─────────────────────
export function ControlBtn({ icon, label, onClick, active = false, danger = false, disabled = false }) {
  const bg = danger ? (active ? '#ef4444' : '#fee2e2') : (active ? TC.primary : '#f1f5f9');
  const co = danger ? (active ? 'white' : '#ef4444') : (active ? 'white' : '#374151');
  return (
    <button onClick={onClick} disabled={disabled}
      title={label}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '12px 16px', borderRadius: 14, background: bg, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.18s', opacity: disabled ? 0.5 : 1, minWidth: 64 }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'scale(1.06)'; }}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <TcIcon name={icon} size={20} color={co} />
      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: co, whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

// ─── Empty state ──────────────────────────────────────────────
export function EmptyState({ icon, title, sub, action, actionLabel }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 24px' }}>
      <div style={{ width: 70, height: 70, borderRadius: '50%', background: `${TC.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 4px 20px ${TC.glow}` }}>
        <TcIcon name={icon} size={30} color={TC.primary} />
      </div>
      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#111827', marginBottom: 6, fontSize: '1rem' }}>{title}</p>
      {sub && <p style={{ fontSize: '0.84rem', color: '#9ca3af', marginBottom: 20 }}>{sub}</p>}
      {action && (
        <button onClick={action} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: TC.primary, color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, fontFamily: 'inherit' }}>
          <TcIcon name="plus" size={14} color="white" />{actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── Utility helpers ──────────────────────────────────────────
export function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
