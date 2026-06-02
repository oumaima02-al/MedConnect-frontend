import { useState, useEffect } from 'react';
import { documentService } from '../../../services/documentService';

/**
 * AdminDocumentViewer
 * Fetches and displays FRONT + BACK professional documents for a given userId.
 * Uses GET /api/users/professional-documents/user/{userId}
 */
export default function AdminDocumentViewer({ userId, userName }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [lightbox, setLightbox]   = useState(null); // { src, title }
  const [downloading, setDownloading] = useState({}); // { [docId]: true }

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const fetchDocs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await documentService.getDocumentsByUser(userId);
        const docs = res.data?.data || res.data || [];
        setDocuments(Array.isArray(docs) ? docs : []);
      } catch (err) {
        console.error('[AdminDocumentViewer] Failed to fetch documents:', err);
        // 404 = no documents uploaded yet, not an error
        if (err?.response?.status === 404) {
          setDocuments([]);
        } else {
          setError('Impossible de charger les documents.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [userId]);

  const handleDownload = async (e, doc) => {
    e.stopPropagation();
    setDownloading(prev => ({ ...prev, [doc.id]: true }));
    try {
      const res = await documentService.downloadDocument(doc.id);
      const blob = new Blob([res.data]);
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      // Try to get extension from MIME type
      const ext  = res.headers?.['content-type']?.includes('pdf') ? 'pdf' : 'jpg';
      link.href  = url;
      link.setAttribute('download', `${doc.side || 'document'}_${userId}.${ext}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[AdminDocumentViewer] Download failed:', err);
    } finally {
      setDownloading(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 14 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            flex: 1, height: 120, borderRadius: 12,
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
          }} />
        ))}
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        padding: '10px 14px', borderRadius: 10,
        background: '#fef2f2', border: '1px solid #fecaca',
        fontSize: '0.75rem', color: '#dc2626'
      }}>
        {error}
      </div>
    );
  }

  // ── Map documents by SIDE ──────────────────────────────────────────────
  const frontDoc = documents.find(d => d.side === 'FRONT' || d.side === 'front');
  const backDoc  = documents.find(d => d.side === 'BACK'  || d.side === 'back');

  const sides = [
    { key: 'FRONT', label: 'Recto', doc: frontDoc },
    { key: 'BACK',  label: 'Verso',  doc: backDoc  },
  ];

  const docUrl = (doc) => doc?.documentUrl || doc?.url || doc?.fileUrl || null;

  return (
    <>
      {/* No documents notice */}
      {documents.length === 0 && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: '#fffbeb', border: '1px dashed #fde68a',
          fontSize: '0.75rem', color: '#92400e', fontWeight: 500,
        }}>
          ⚠️ Aucun document téléchargé par cet utilisateur.
        </div>
      )}

      {documents.length > 0 && (
        <div style={{ display: 'flex', gap: 14 }}>
          {sides.map(side => {
            const url = docUrl(side.doc);
            return (
              <div
                key={side.key}
                style={{
                  flex: 1, height: 120, borderRadius: 12, overflow: 'hidden', position: 'relative',
                  border: url ? '1.5px solid #86efac' : '1.5px dashed #e2e8f0',
                  background: '#f8fafc',
                }}
              >
                {url ? (
                  <>
                    {/* Thumbnail — click to open lightbox */}
                    <div
                      onClick={() => setLightbox({ src: url, title: `${side.label} — ${userName}` })}
                      style={{
                        width: '100%', height: '100%',
                        backgroundImage: `url(${url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    {/* Footer bar */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(4px)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '5px 10px',
                    }}>
                      <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>
                        {side.label}
                      </span>
                      <button
                        onClick={(e) => handleDownload(e, side.doc)}
                        disabled={downloading[side.doc?.id]}
                        title="Télécharger"
                        style={{
                          background: 'rgba(255,255,255,0.15)', border: 'none',
                          borderRadius: 5, color: 'white', cursor: 'pointer',
                          padding: '2px 7px', fontSize: '0.68rem', fontWeight: 600,
                        }}
                      >
                        {downloading[side.doc?.id] ? '…' : '⬇ DL'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="3" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {side.label} manquant
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={() => setLightbox(null)}
        >
          <div onClick={e => e.stopPropagation()} style={{
            position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            maxWidth: '90%',
          }}>
            <button
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: -48, right: 0,
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', cursor: 'pointer', fontSize: '1.1rem',
              }}
            >✕</button>
            <img
              src={lightbox.src}
              alt={lightbox.title}
              style={{
                maxWidth: '100%', maxHeight: '80vh', borderRadius: 16,
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                border: '3px solid rgba(255,255,255,0.1)',
              }}
            />
            <span style={{
              color: 'white', fontSize: '0.92rem', fontWeight: 600,
              fontFamily: "'Sora', sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              {lightbox.title}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
