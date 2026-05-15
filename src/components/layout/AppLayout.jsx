import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../features/auth/services/authService';

const NAV = {
  PATIENT: [
    { to: '/app/dashboard',        label: 'Tableau de bord', icon: 'grid' },
    { to: '/app/appointments',     label: 'Mes rendez-vous', icon: 'calendar' },
    { to: '/app/medical-records',  label: 'Dossier médical', icon: 'file' },
    { to: '/app/prescriptions',    label: 'Ordonnances',     icon: 'pill' },
    { to: '/app/messages',         label: 'Messagerie',      icon: 'message' },
    { to: '/app/profile', label: 'Mon profil', icon: 'user' },
    { to: '/app/patient-profile', label: 'Profil médical', icon: 'heart' },
  ],
  DOCTOR: [
    { to: '/app/dashboard',        label: 'Tableau de bord', icon: 'grid' },
    { to: '/app/patients',         label: 'Mes patients',    icon: 'users' },
    { to: '/app/schedule',         label: 'Planning',        icon: 'calendar' },
    { to: '/app/prescriptions',    label: 'Prescriptions',   icon: 'pill' },
    { to: '/app/messages',         label: 'Messagerie',      icon: 'message' },
    { to: '/app/profile', label: 'Mon profil', icon: 'user' },
  ],
  PHARMACIST: [
    { to: '/app/dashboard',        label: 'Tableau de bord', icon: 'grid' },
    { to: '/app/prescriptions',    label: 'Ordonnances',     icon: 'pill' },
    { to: '/app/messages',         label: 'Messagerie',      icon: 'message' },
    { to: '/app/profile', label: 'Mon profil', icon: 'user' },
  ],
};

const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'grid':    return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
    case 'calendar':return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case 'file':    return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case 'pill':    return <svg {...props}><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>;
    case 'message': return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case 'users':   return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'logout':  return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
    case 'bell':    return <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case 'user': return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'heart': return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    default: return null;
  }
};

export { Icon };

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || 'PATIENT';
  const navItems = NAV[role] || NAV.PATIENT;

  const roleLabel = { PATIENT: 'Patient', DOCTOR: 'Médecin', PHARMACIST: 'Pharmacie' }[role] || role;
  const initials  = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase() || 'DA';

  const handleLogout = async () => {
    await authService.logout().catch(() => {});
    authService.clearSession();
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .dw-nav-link { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:12px; text-decoration:none; color:#6b7280; font-size:0.88rem; font-weight:500; transition:all 0.18s; }
        .dw-nav-link:hover { background:#f3f4f6; color:#111827; }
        .dw-nav-link.active { background:rgba(46,204,113,0.1); color:#16a34a; font-weight:600; }
        .dw-nav-link.active svg { stroke:#2ecc71; }
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside style={{
        width: collapsed ? 68 : 240,
        background: 'white',
        borderRight: '1px solid #f3f4f6',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px',
        transition: 'width 0.25s ease',
        position: 'sticky', top: 0, height: '100vh',
        overflowX: 'hidden', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: '#2ecc71',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          {!collapsed && (
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#111827', whiteSpace: 'nowrap' }}>
              Dawini
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `dw-nav-link${isActive ? ' active' : ''}`}>
              <Icon name={icon} size={19} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — user + logout */}
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: '#065f46',
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.prenom} {user?.nom}
                </div>
                <div style={{ fontSize: '0.73rem', color: '#9ca3af' }}>{roleLabel}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="dw-nav-link"
            style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none', fontFamily: 'inherit', justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <Icon name="logout" size={18} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 64, background: 'white',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#6b7280' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: '#6b7280' }}>
              <Icon name="bell" size={20} />
              <span style={{
                position: 'absolute', top: -2, right: -2,
                width: 8, height: 8, borderRadius: '50%',
                background: '#2ecc71', border: '1.5px solid white',
              }} />
            </button>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12, color: '#065f46',
              cursor: 'pointer',
            }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}