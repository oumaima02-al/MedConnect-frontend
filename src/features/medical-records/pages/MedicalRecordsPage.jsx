import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { TabBar } from '../components/DMPShared';
import DMPSummaryCard    from '../components/DMPSummaryCard';
import AllergiesSection  from '../components/AllergiesSection';
import MedicationsSection from '../components/MedicationsSection';
import ConditionsSection  from '../components/ConditionsSection';
import ConsultationsSection from '../components/ConsultationsSection';
import LabResultsSection  from '../components/LabResultsSection';
import VaccinationsSection from '../components/VaccinationsSection';
import DocumentsSection   from '../components/DocumentsSection';
import ImagingSection     from '../components/ImagingSection';
import HealthNotebookSection from '../components/HealthNotebookSection';
import ConsentSection     from '../components/ConsentSection';
import AccessLogSection   from '../components/AccessLogSection';

const TABS = [
  { key: 'overview',       label: 'Vue d\'ensemble', icon: 'heart',          color: '#2ecc71' },
  { key: 'allergies',      label: 'Allergies',       icon: 'alert-triangle', color: '#ef4444' },
  { key: 'medications',    label: 'Médicaments',     icon: 'pill',           color: '#7c3aed' },
  { key: 'conditions',     label: 'Maladies',        icon: 'activity',       color: '#0891b2' },
  { key: 'consultations',  label: 'Consultations',   icon: 'clipboard',      color: '#059669' },
  { key: 'lab',            label: 'Analyses',        icon: 'git-commit',     color: '#0891b2' },
  { key: 'vaccinations',   label: 'Vaccinations',    icon: 'syringe',        color: '#d97706' },
  { key: 'documents',      label: 'Documents',       icon: 'file-text',      color: '#7c3aed' },
  { key: 'imaging',        label: 'Imagerie',        icon: 'image',          color: '#7c3aed' },
  { key: 'vitals',         label: 'Carnet santé',    icon: 'thermometer',    color: '#059669' },
  { key: 'consent',        label: 'Accès',           icon: 'shield',         color: '#059669' },
  { key: 'access-log',     label: 'Journal',         icon: 'log',            color: '#6b7280' },
];

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const { id: routePatientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Use patientId from user context; fallback for dev
  const patientId = routePatientId || user?.id || user?.userId || 'patient-1';
  const isDoctorPatientRecord = Boolean(routePatientId);

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .dmp-page * { box-sizing: border-box; }
      `}</style>

      <div className="dmp-page">
        {isDoctorPatientRecord && (
          <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', color: '#111827' }}>Dossier medical du patient</h1>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Completez les informations cliniques apres la consultation.</p>
            </div>
            <button onClick={() => navigate(`/doctor/patients/${patientId}`)} style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>
              Retour au patient
            </button>
          </div>
        )}
        {/* Summary Header */}
        <DMPSummaryCard patientId={patientId} />

        {/* Tab Navigation */}
        <div style={{ marginBottom: 24 }}>
          <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <AllergiesSection patientId={patientId} />
                <MedicationsSection patientId={patientId} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <ConditionsSection patientId={patientId} />
                <HealthNotebookSection patientId={patientId} />
              </div>
              <ConsultationsSection patientId={patientId} />
            </div>
          )}

          {activeTab === 'allergies' && <AllergiesSection patientId={patientId} />}
          {activeTab === 'medications' && <MedicationsSection patientId={patientId} />}
          {activeTab === 'conditions' && <ConditionsSection patientId={patientId} />}
          {activeTab === 'consultations' && <ConsultationsSection patientId={patientId} />}
          {activeTab === 'lab' && <LabResultsSection patientId={patientId} />}
          {activeTab === 'vaccinations' && <VaccinationsSection patientId={patientId} />}
          {activeTab === 'documents' && <DocumentsSection patientId={patientId} />}
          {activeTab === 'imaging' && <ImagingSection patientId={patientId} />}
          {activeTab === 'vitals' && <HealthNotebookSection patientId={patientId} />}
          {activeTab === 'consent' && <ConsentSection patientId={patientId} />}
          {activeTab === 'access-log' && <AccessLogSection patientId={patientId} />}
        </div>
      </div>
    </div>
  );
}
