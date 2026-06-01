import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import PrescriptionList from '../components/PrescriptionList';
import PrescriptionDetail from '../components/PrescriptionDetail';

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const patientId = user?.id || user?.userId || 'patient-1';

  const [selectedRx, setSelectedRx] = useState(null);

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .rx-page * { box-sizing: border-box; }
      `}</style>
      <div className="rx-page">
        {selectedRx ? (
          <PrescriptionDetail rxId={selectedRx} onBack={() => setSelectedRx(null)} />
        ) : (
          <div style={{ maxWidth: 900 }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#111827', margin: 0 }}>
                Gestion des ordonnances
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 4 }}>
                Consultez, ajoutez et demandez des renouvellements.
              </p>
            </div>
            <PrescriptionList patientId={patientId} onSelect={setSelectedRx} />
          </div>
        )}
      </div>
    </div>
  );
}
