import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');

  // Use patientId from user context; fallback for dev
  const patientId = user?.id || user?.userId || 'patient-1';

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .dmp-page * { box-sizing: border-box; }
      `}</style>

      <div className="dmp-page">
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
