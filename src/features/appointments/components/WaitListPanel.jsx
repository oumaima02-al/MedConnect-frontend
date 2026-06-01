import { useState } from 'react';
import {
  Card, ApptIcon, EmptyState, ErrorBanner, SectionHeader,
  Field, Input, SubmitBtn, COLORS, SuccessBanner,
} from './ApptShared';
import { useWaitList } from '../hooks/useAppointments';

export default function WaitListPanel({ patientId }) {
  const [doctorId, setDoctorId] = useState('');
  const [searchDoctorId, setSearchDoctorId] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [joining, setJoining]   = useState(false);
  const [leaving, setLeaving]   = useState(false);
  const [joinErr, setJoinErr]   = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const { doctors, loading: docsLoading } = useDoctorsList();
  const { position, loading, error, fetchPosition, join, leave } = useWaitList(patientId, searchDoctorId);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!doctorId.trim()) return;
    setSearchDoctorId(doctorId.trim());
    fetchPosition();
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinErr('');
    setJoinSuccess(false);
    if (!requestedDate) { setJoinErr('Veuillez choisir une date souhaitée.'); return; }
    setJoining(true);
    try {
      await join(requestedDate);
      setJoinSuccess(true);
      setTimeout(() => setJoinSuccess(false), 3000);
    } catch (e) {
      setJoinErr(e?.response?.data?.message || 'Erreur lors de l\'inscription sur la liste d\'attente.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await leave();
    } catch (e) {
      console.error(e);
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#111827', margin: 0 }}>
          Liste d'attente
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 4 }}>
          Inscrivez-vous sur la liste d'attente d'un médecin pour être averti d'une disponibilité.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Search section */}
        <Card>
          <SectionHeader icon="search" title="Vérifier ma position" color={COLORS.primary} />
          <div style={{ padding: '20px 24px' }}>
            <form onSubmit={handleSearch}>
              <Field label="Médecin" required>
                <Select 
                  id="wait-doctorId" 
                  value={doctorId} 
                  onChange={e => setDoctorId(e.target.value)} 
                  placeholder={docsLoading ? "Chargement..." : "Choisir un médecin..."}
                  disabled={docsLoading}
                  options={doctors.map(d => ({
                    value: d.id,
                    label: `Dr. ${d.prenom} ${d.nom}`
                  }))}
                  required 
                />
              </Field>
              <SubmitBtn label="Vérifier ma position" icon="search" type="submit" />
            </form>

            {searchDoctorId && (
              <div style={{ marginTop: 20 }}>
                {loading && <div style={{ textAlign: 'center', color: '#9ca3af', padding: '12px 0' }}>Chargement…</div>}
                {error && !loading && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <ApptIcon name="info" size={24} color="#9ca3af" />
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: 0 }}>Vous n'êtes pas sur la liste d'attente pour ce médecin.</p>
                  </div>
                )}
                {!loading && position !== null && position !== undefined && (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 20px rgba(14,165,233,0.15)' }}>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '2rem', color: COLORS.primary }}>{position}</span>
                    </div>
                    <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                      Votre position : <span style={{ color: COLORS.primary }}>#{position}</span>
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 18 }}>
                      Médecin : <strong>{doctors.find(d => d.id === searchDoctorId)?.nom ? `Dr. ${doctors.find(d => d.id === searchDoctorId).prenom} ${doctors.find(d => d.id === searchDoctorId).nom}` : searchDoctorId}</strong>
                    </p>
                    <button id="btn-leave-waitlist" onClick={handleLeave} disabled={leaving}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto', padding: '8px 18px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: leaving ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit' }}>
                      <ApptIcon name="x" size={13} color="#dc2626" />
                      {leaving ? 'Suppression…' : 'Se retirer de la liste'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Join section */}
        <Card>
          <SectionHeader icon="wait" title="Rejoindre une liste d'attente" color="#6366f1" />
          <div style={{ padding: '20px 24px' }}>
            {joinSuccess && <SuccessBanner message="Vous avez été ajouté à la liste d'attente !" />}
            {joinErr && <div style={{ color: '#dc2626', fontSize: '0.84rem', marginBottom: 12, background: '#fef2f2', borderRadius: 8, padding: '8px 12px' }}>{joinErr}</div>}

            <form onSubmit={handleJoin}>
              <Field label="Médecin" required>
                <Select 
                  id="join-doctorId" 
                  value={searchDoctorId || doctorId}
                  onChange={e => { setDoctorId(e.target.value); setSearchDoctorId(''); }}
                  placeholder={docsLoading ? "Chargement..." : "Choisir un médecin..."}
                  disabled={docsLoading}
                  options={doctors.map(d => ({
                    value: d.id,
                    label: `Dr. ${d.prenom} ${d.nom}`
                  }))}
                  required 
                />
              </Field>
              <Field label="Date souhaitée" required hint="La date doit être aujourd'hui ou dans le futur">
                <Input id="join-date" type="date" value={requestedDate} onChange={e => setRequestedDate(e.target.value)} min={today} required />
              </Field>

              {/* Info box */}
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ApptIcon name="info" size={16} color="#0ea5e9" />
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#0c4a6e', fontWeight: 600, margin: '0 0 3px' }}>Comment ça marche ?</p>
                    <p style={{ fontSize: '0.78rem', color: '#075985', margin: 0 }}>
                      En cas d'annulation ou de disponibilité, vous serez contacté dans l'ordre de la liste.
                    </p>
                  </div>
                </div>
              </div>

              <SubmitBtn label="Rejoindre la liste d'attente" loading={joining} icon="plus" color="#6366f1" />
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
