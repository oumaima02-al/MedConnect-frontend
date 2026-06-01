import { useDMPSummary } from '../hooks/useDMP';
import { Icon, fmtDate } from './DMPShared';
import * as dmp from '../services/dmpService';
import { useState } from 'react';

const STAT_CARDS = [
  { key: 'allergies',          label: 'Allergies',       icon: 'alert-triangle', color: '#ef4444', bg: '#fef2f2' },
  { key: 'currentMedications', label: 'Médicaments',     icon: 'pill',           color: '#7c3aed', bg: '#faf5ff' },
  { key: 'chronicConditions',  label: 'Maladies chron.', icon: 'activity',       color: '#0891b2', bg: '#f0f9ff' },
  { key: 'vaccinations',       label: 'Vaccinations',    icon: 'syringe',        color: '#d97706', bg: '#fffbeb' },
  { key: 'recentLabResults',   label: 'Analyses',        icon: 'git-commit',     color: '#059669', bg: '#f0fdf4' },
  { key: 'documents',          label: 'Documents',       icon: 'file-text',      color: '#6b7280', bg: '#f8fafc' },
];

export default function DMPSummaryCard({ patientId }) {
  const { data: summary, loading } = useDMPSummary(patientId);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    setExportMsg(null);
    try {
      const res = await dmp.exportFHIR(patientId);
      setExportMsg({ ok: true, text: 'Export FHIR généré avec succès !' });
      // In a real app: download the JSON
      console.log('FHIR Bundle:', res.data?.data);
    } catch {
      setExportMsg({ ok: false, text: 'Erreur lors de l\'export FHIR.' });
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(null), 4000);
    }
  };

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#111827', margin: 0 }}>
            Dossier Médical Patient
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 4 }}>
            ID patient : <code style={{ background: '#f3f4f6', padding: '2px 7px', borderRadius: 6, color: '#374151' }}>{patientId}</code>
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <button
            id="btn-export-fhir"
            onClick={handleExport}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: exporting ? '#9ca3af' : 'linear-gradient(135deg, #2ecc71, #16a34a)',
              color: 'white', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontWeight: 700, fontSize: '0.85rem',
              boxShadow: '0 4px 15px rgba(46,204,113,0.3)',
              transition: 'all 0.2s',
            }}
          >
            <Icon name="download" size={16} color="white" />
            {exporting ? 'Export en cours…' : 'Exporter FHIR'}
          </button>
          {exportMsg && (
            <span style={{
              fontSize: '0.78rem', fontWeight: 600,
              color: exportMsg.ok ? '#16a34a' : '#dc2626',
              background: exportMsg.ok ? '#f0fdf4' : '#fef2f2',
              padding: '4px 10px', borderRadius: 8,
              border: `1px solid ${exportMsg.ok ? '#bbf7d0' : '#fecaca'}`,
            }}>
              {exportMsg.text}
            </span>
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {STAT_CARDS.map(({ key, label, icon, color, bg }) => {
          const items = summary?.[key];
          const count = Array.isArray(items) ? items.length : '—';
          return (
            <div key={key} style={{
              background: 'white',
              border: '1px solid #f3f4f6',
              borderRadius: 16,
              padding: '16px 18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'transform 0.15s, box-shadow 0.15s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={icon} size={19} color={color} />
              </div>
              <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#111827', lineHeight: 1 }}>
                  {loading ? '…' : count}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
