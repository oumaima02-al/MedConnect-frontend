import { useEffect, useState } from 'react';
import { Icon } from '../../../components/layout/AppLayout';
import { useAuth } from '../../../context/AuthContext';
import { dmpService } from '../../../services/medicalService';

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2000, background: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: 16, boxShadow: '0 20px 25px -5px rgba(0,0,0,.3)', fontWeight: 700 }}>{message}</div>;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function inferDocumentType(file) {
  const name = file.name.toLowerCase();
  if (name.includes('radio') || name.includes('scanner') || name.includes('irm') || name.match(/\.(jpg|jpeg|png)$/)) return 'IMAGING';
  if (name.includes('analyse') || name.includes('lab') || name.includes('sang')) return 'LAB';
  if (name.includes('ordonnance') || name.includes('prescription')) return 'PRESCRIPTION';
  if (name.includes('rapport') || name.includes('certificat')) return 'REPORT';
  return 'OTHER';
}

function formatDate(value) {
  if (!value) return '-';
  try { return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return value; }
}

function escapePdfText(value) {
  return String(value || '').replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7E]/g, '');
}

function createFallbackPdf(doc) {
  const title = escapePdfText(doc.documentName || 'Document');
  const type = escapePdfText(doc.documentType || '-');
  const uploadedBy = escapePdfText(doc.uploadedBy || 'Patient');
  const lines = [
    'MedConnect - Document archive',
    `Document: ${title}`,
    `Type: ${type}`,
    `Ajoute par: ${uploadedBy}`,
    '',
    'Le contenu original de ce document ancien',
    'n est pas disponible dans le stockage local.',
    'Reimportez le fichier pour telecharger le PDF original.'
  ];
  const textOps = lines.map((line, index) => `BT /F1 12 Tf 72 ${760 - index * 22} Td (${escapePdfText(line)}) Tj ET`).join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${textOps.length} >> stream\n${textOps}\nendstream endobj`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj) => { offsets.push(pdf.length); pdf += `${obj}\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}
function downloadDocument(doc) {
  if (!doc?.fileUrl) return;
  const name = doc.documentName || 'document';
  let href = doc.fileUrl;
  let downloadName = name;
  let revoke = false;
  const isDataFile = String(href).startsWith('data:');

  if (!isDataFile) {
    href = URL.createObjectURL(createFallbackPdf(doc));
    downloadName = name.toLowerCase().endsWith('.pdf') ? name : `${name.replace(/\.[^.]+$/, '')}.pdf`;
    revoke = true;
  }

  const link = document.createElement('a');
  link.href = href;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (revoke) URL.revokeObjectURL(href);
}

export default function PatientDocumentsPage() {
  const { user } = useAuth();
  const patientId = user?.id || user?.userId || user?.sub;
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.fullName || user?.email || 'Patient';
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const loadDocuments = async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const res = await dmpService.getDocuments(patientId);
      const payload = res.data?.data ?? res.data;
      setDocs(Array.isArray(payload) ? payload : payload?.content || payload?.items || []);
    } catch (e) {
      setDocs([]);
      setError('Impossible de charger vos documents.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadDocuments(); }, [patientId]);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file || !patientId) return;
      setUploading(true);
      setError('');
      try {
        const fileUrl = await readFileAsDataUrl(file);
        await dmpService.uploadDocument(patientId, {
          documentName: file.name,
          documentType: inferDocumentType(file),
          fileUrl,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
          uploadedBy: displayName,
          description: `Document importe par le patient (${Math.round(file.size / 1024)} KB)`,
        });
        await loadDocuments();
        setToast('Document ajoute au DMP avec succes.');
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Erreur pendant l import du document.');
      } finally { setUploading(false); }
    };
    input.click();
  };

  const handleDownload = async (doc) => {
    if (!doc?.fileUrl && !doc?.id) return;
    const key = doc.id || doc.documentName || 'document';
    setDownloadingId(key);
    setError('');
    try {
      let fullDoc = doc;
      if (!fullDoc.fileUrl && doc.id) {
        const res = await dmpService.getDocument(patientId, doc.id);
        fullDoc = res.data?.data ?? res.data;
      }
      downloadDocument(fullDoc);
    } catch (err) {
      setError(err?.response?.data?.message || 'Impossible de telecharger ce document.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 34, gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: 0 }}>Mes Documents Medicaux</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginTop: 4 }}>Documents ajoutes a votre dossier medical.</p>
        </div>
        <button onClick={handleUpload} disabled={uploading || !patientId} style={{ padding: '14px 28px', borderRadius: 16, background: uploading ? '#86efac' : '#2ecc71', color: 'white', border: 'none', fontWeight: 800, cursor: uploading ? 'not-allowed' : 'pointer', boxShadow: uploading ? 'none' : '0 10px 15px -3px rgba(46,204,113,.3)' }}>
          {uploading ? 'Importation...' : 'Importer un document'}
        </button>
      </div>
      {error && <div style={{ marginBottom: 18, padding: 14, borderRadius: 12, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</div>}
      {loading ? <div style={{ color: '#94a3b8', fontWeight: 700 }}>Chargement des documents...</div> : docs.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 22, padding: 42, textAlign: 'center', color: '#94a3b8' }}>Aucun document importe pour le moment.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {docs.map((doc, index) => (
            <div key={doc.id || index} style={{ background: 'white', border: '1.5px solid #f1f5f9', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,.02)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="file" color="#3b82f6" size={24} /></div>
              <div>
                <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{doc.documentName || 'Document'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', background: '#f5f3ff', padding: '2px 8px', borderRadius: 6 }}>{doc.documentType || 'DOCUMENT'}</span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{formatDate(doc.createdAt || doc.uploadedAt)}</span>
                </div>
              </div>
              <button onClick={() => handleDownload(doc)} disabled={downloadingId === (doc.id || doc.documentName || 'document') || (!doc.fileUrl && !doc.id)} style={{ padding: 12, borderRadius: 12, background: (doc.fileUrl || doc.id) ? '#dcfce7' : '#f1f5f9', border: 'none', fontSize: '0.82rem', fontWeight: 800, color: (doc.fileUrl || doc.id) ? '#166534' : '#94a3b8', cursor: (doc.fileUrl || doc.id) ? 'pointer' : 'not-allowed' }}>{downloadingId === (doc.id || doc.documentName || 'document') ? 'Preparation...' : 'Telecharger'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



