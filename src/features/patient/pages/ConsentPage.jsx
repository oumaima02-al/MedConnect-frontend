import { useState, useEffect } from 'react';
import { dmpService } from '../../../services/medicalService';
import { Icon } from '../../../components/layout/AppLayout';
import { useDoctorsList } from '../../appointments/hooks/useAppointments';

function SelectField({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#374151' }}>{label}</label>
      <select 
        value={value} 
        onChange={onChange}
        disabled={disabled}
        style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f8fafc', fontSize: '0.95rem', color: '#111827', outline: 'none' }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

export default function ConsentPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ id: '', specialty: '' });
  const { doctors: systemDocs, loading: docsLoading } = useDoctorsList();

  const SPECIALTIES = [
    "Cardiologie", "Généraliste", "Dermatologie", "Pédiatrie", "Ophtalmologie", 
    "Neurologie", "Gynécologie", "Psychiatrie", "Orthopédie", "Gastro-entérologie"
  ];

  useEffect(() => {
    // Simulate fetching consented doctors
    setTimeout(() => {
      setDoctors([
        { id: 'dr-1', name: 'Dr. Karim Alami', specialty: 'Cardiologue', accessDate: '12 Jan 2024' },
        { id: 'dr-2', name: 'Dr. Sara Benali', specialty: 'Généraliste', accessDate: '05 Mars 2024' }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleRevoke = (id) => {
    if (confirm('Voulez-vous vraiment révoquer l\'accès à ce médecin ?')) {
      setDoctors(doctors.filter(d => d.id !== id));
    }
  };

  const handleGrant = (e) => {
    e.preventDefault();
    if (!newDoc.id || !newDoc.specialty) return;
    
    const selectedDoc = systemDocs.find(d => d.id === newDoc.id);
    const docName = selectedDoc ? `Dr. ${selectedDoc.prenom} ${selectedDoc.nom}` : 'Médecin inconnu';

    const doc = {
      id: newDoc.id,
      name: docName,
      specialty: newDoc.specialty,
      accessDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    
    setDoctors([...doctors, doc]);
    setShowModal(false);
    setNewDoc({ id: '', specialty: '' });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
            Gestion des accès
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Contrôlez qui peut consulter vos données médicales.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ 
            padding: '12px 24px', borderRadius: 12, background: '#16a34a', color: 'white', 
            border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 
          }}
        >
          <Icon name="user" color="white" /> Accorder un accès
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 24, padding: '32px', border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: '#111827' }}>Médecins autorisés ({doctors.length})</h3>
        
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>Chargement...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {doctors.map(dr => (
              <div key={dr.id} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '16px 20px', borderRadius: 16, background: '#f8fafc', border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="user" color="#4338ca" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{dr.name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>{dr.specialty} • {dr.accessDate}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRevoke(dr.id)}
                  style={{ 
                    padding: '8px 16px', borderRadius: 10, background: '#fef2f2', color: '#dc2626', 
                    border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                  }}>
                  Révoquer
                </button>
              </div>
            ))}
            {doctors.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Aucun accès accordé pour le moment.</p>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 32, padding: 20, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: 16, border: '1px solid #86efac' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#166534', lineHeight: 1.6 }}>
            <strong>Note sur la sécurité:</strong> Les médecins n'ont accès à votre DMP que si vous leur accordez explicitement le droit. Vous pouvez révoquer cet accès à tout moment.
          </p>
        </div>
      </div>

      {/* Basic Modal for granting access */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.2rem', fontWeight: 800, marginBottom: 20 }}>Autoriser un médecin</h2>
            <form onSubmit={handleGrant}>
              <SelectField 
                label="Nom du médecin"
                value={newDoc.id}
                onChange={e => {
                  const d = systemDocs.find(sd => sd.id === e.target.value);
                  setNewDoc({ ...newDoc, id: e.target.value, specialty: d?.profile?.specialty || '' });
                }}
                disabled={docsLoading}
                placeholder={docsLoading ? "Chargement..." : "Choisir un médecin..."}
                options={systemDocs.map(d => ({ value: d.id, label: `Dr. ${d.prenom} ${d.nom}` }))}
              />
              <SelectField 
                label="Spécialité"
                value={newDoc.specialty}
                onChange={e => setNewDoc({ ...newDoc, specialty: e.target.value })}
                placeholder="Sélectionner la spécialité..."
                options={SPECIALTIES.map(s => ({ value: s, label: s }))}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
