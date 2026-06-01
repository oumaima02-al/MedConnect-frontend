import { useState, useEffect } from 'react';
import { Icon } from '../../../components/layout/AppLayout';

// ─── Document Viewer Modal ───────────────────────────────────────
function ViewerModal({ open, doc, onClose }) {
  if (!open || !doc) return null;
  const isPdf = doc.name.toLowerCase().endsWith('.pdf');
  
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 0.3s ease'
    }} onClick={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>
      <div 
        style={{
          background: 'white', borderRadius: 24, width: '100%', maxWidth: 900, height: '85vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="file" color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{doc.name}</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{doc.type} • {doc.date}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="logout" size={18} color="#64748b" />
          </button>
        </div>
        <div style={{ flex: 1, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
           {isPdf ? (
             <div style={{ textAlign: 'center' }}>
                <Icon name="file" size={64} color="#CBD5E1" />
                <p style={{ marginTop: 20, color: '#64748b', fontSize: '0.9rem' }}>Prévisualisation du PDF : <strong>{doc.name}</strong></p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                   <button style={{ padding: '10px 20px', borderRadius: 12, background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Télécharger</button>
                   <button style={{ padding: '10px 20px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}>Imprimer</button>
                </div>
             </div>
           ) : (
             <div style={{ width: '100%', height: '100%', borderRadius: 12, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Icon name="image" size={48} color="#94a3b8" />
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

// ─── Toast Notification ──────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000, background: '#1e293b', color: 'white', padding: '12px 24px',
      borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      display: 'flex', alignItems: 'center', gap: 12, animation: 'toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`
        @keyframes toastIn { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="file" size={14} color="white" />
      </div>
      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{message}</span>
    </div>
  );
}

export default function PatientDocumentsPage() {
  const [docs, setDocs] = useState([
    { id: 1, name: 'Analyse Sang.pdf', date: '12 Mai 2024', type: 'LABO' },
    { id: 2, name: 'Radio Thorax.jpg', date: '10 Mai 2024', type: 'IMAGERIE' }
  ]);
  const [uploading, setUploading] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploading(true);
        setTimeout(() => {
          const newDoc = {
            id: Date.now(),
            name: file.name,
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
            type: 'DOCUMENT'
          };
          setDocs([newDoc, ...docs]);
          setUploading(false);
          setToast('Document importé avec succès !');
        }, 1500);
      }
    };
    input.click();
  };

  const handleRemove = (id) => {
    setDocs(docs.filter(d => d.id !== id));
    setConfirmDelete(null);
    setToast('Document supprimé');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Viewer Modal */}
      <ViewerModal open={!!viewingDoc} doc={viewingDoc} onClose={() => setViewingDoc(null)} />

      {/* Custom Confirmation Dialog */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Icon name="logout" color="#ef4444" size={32} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800 }}>Supprimer ?</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#64748b' }}>Voulez-vous vraiment supprimer <strong>{confirmDelete.name}</strong> ? Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#f1f5f9', border: 'none', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleRemove(confirmDelete.id)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#ef4444', border: 'none', fontWeight: 700, color: 'white', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Mes Documents Médicaux
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginTop: 4 }}>Gérez et sécurisez vos résultats d'analyses et copies médicales.</p>
        </div>
        <button 
          onClick={handleUpload}
          disabled={uploading}
          style={{ 
            padding: '14px 28px', borderRadius: 16, background: uploading ? '#86efac' : '#2ecc71', color: 'white', 
            border: 'none', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: uploading ? 'none' : '0 10px 15px -3px rgba(46, 204, 113, 0.3)'
          }}
          onMouseEnter={e => { if(!uploading) e.currentTarget.style.transform = 'translateY(-2px)'}}
          onMouseLeave={e => { if(!uploading) e.currentTarget.style.transform = 'translateY(0)'}}
        >
          {uploading ? (
            <div style={{ width: 18, height: 18, border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          ) : <Icon name="file" color="white" />}
          {uploading ? 'Importation en cours...' : 'Importer un document'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        {docs.map((doc) => (
          <div key={doc.id} style={{ 
            background: 'white', border: '1.5px solid #f1f5f9', borderRadius: 28, padding: '24px',
            display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.borderColor = '#dcfce7';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = '#f1f5f9';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02)';
          }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="file" color="#3b82f6" size={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 6px 0', fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{doc.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <span style={{ fontSize: '0.75rem', fontWeight: 700, color: doc.type === 'LABO' ? '#6366f1' : '#ec4899', background: doc.type === 'LABO' ? '#f5f3ff' : '#fdf2f8', padding: '2px 8px', borderRadius: 6 }}>{doc.type}</span>
                 <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>• {doc.date}</span>
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setViewingDoc(doc)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#f1f5f9', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                Visionner
              </button>
              <button 
                onClick={() => setConfirmDelete(doc)}
                style={{ width: 44, height: 44, borderRadius: 12, background: '#fff1f2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ffe4e6'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff1f2'}
                title="Supprimer"
              >
                 <Icon name="logout" size={18} color="#ef4444" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
