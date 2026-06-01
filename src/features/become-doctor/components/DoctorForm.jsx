import { useState } from 'react';

const SPECIALTIES = [
  'Médecine générale', 'Cardiologie', 'Chirurgie générale', 'Dermatologie',
  'Endocrinologie', 'Gastro-entérologie', 'Gériatrie', 'Gynécologie',
  'Hématologie', 'Infectiologie', 'Médecine interne', 'Néphrologie',
  'Neurologie', 'Oncologie', 'Ophtalmologie', 'ORL', 'Orthopédie',
  'Pédiatrie', 'Pneumologie', 'Psychiatrie', 'Radiologie', 'Rhumatologie',
  'Stomatologie', 'Urologie',
];

const LANGUAGES = [
  { code: 'AR', label: 'العربية' },
  { code: 'FR', label: 'Français' },
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Español' },
  { code: 'DE', label: 'Deutsch' },
];

const Field = ({ label, required, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: '0.83rem', fontWeight: 600, color: '#374151' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {children}
    {error && (
      <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {error}
      </span>
    )}
  </div>
);

const inputStyle = (hasErr) => ({
  width: '100%', padding: '10px 14px', borderRadius: 10, boxSizing: 'border-box',
  border: `1.5px solid ${hasErr ? '#fca5a5' : '#e5e7eb'}`,
  background: hasErr ? '#fff7f7' : 'white',
  fontSize: '0.88rem', color: '#111827', outline: 'none',
  fontFamily: "'DM Sans',sans-serif",
  transition: 'border 0.2s',
});

export default function DoctorForm({ values, onChange, errors }) {
  const [langOpen, setLangOpen] = useState(false);

  const toggleLang = (code) => {
    const current = values.languages || [];
    onChange({
      languages: current.includes(code)
        ? current.filter((l) => l !== code)
        : [...current, code],
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>

      {/* Specialty */}
      <Field label="Spécialité" required error={errors.specialty}>
        <select
          id="bd-specialty"
          value={values.specialty}
          onChange={(e) => onChange({ specialty: e.target.value })}
          style={{ ...inputStyle(!!errors.specialty), appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">— Sélectionner —</option>
          {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>

      {/* Registration number */}
      <Field label="Numéro d'inscription professionnelle" required error={errors.professionalRegistrationNumber}>
        <input
          id="bd-reg-number"
          type="text"
          placeholder="Ex: 12345/MA"
          value={values.professionalRegistrationNumber}
          onChange={(e) => onChange({ professionalRegistrationNumber: e.target.value })}
          style={inputStyle(!!errors.professionalRegistrationNumber)}
        />
      </Field>

      {/* National ID */}
      <Field label="Numéro de la CIN / CNIE" required error={errors.nationalIdNumber}>
        <input
          id="bd-national-id"
          type="text"
          placeholder="Ex: AB123456"
          value={values.nationalIdNumber}
          onChange={(e) => onChange({ nationalIdNumber: e.target.value })}
          style={inputStyle(!!errors.nationalIdNumber)}
        />
      </Field>

      {/* Registration authority */}
      <Field label="Autorité d'enregistrement" error={errors.registrationAuthority}>
        <input
          id="bd-authority"
          type="text"
          placeholder="Ex: Ordre des Médecins du Maroc"
          value={values.registrationAuthority}
          onChange={(e) => onChange({ registrationAuthority: e.target.value })}
          style={inputStyle(false)}
        />
      </Field>

      {/* City */}
      <Field label="Ville" error={errors.city}>
        <input
          id="bd-city"
          type="text"
          placeholder="Ex: Casablanca"
          value={values.city}
          onChange={(e) => onChange({ city: e.target.value })}
          style={inputStyle(false)}
        />
      </Field>

      {/* Clinic */}
      <Field label="Nom de la clinique / cabinet" error={errors.clinicName}>
        <input
          id="bd-clinic"
          type="text"
          placeholder="Ex: Cabinet Médical Al Shifaa"
          value={values.clinicName}
          onChange={(e) => onChange({ clinicName: e.target.value })}
          style={inputStyle(false)}
        />
      </Field>

      {/* Languages — full width */}
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="Langues parlées" error={errors.languages}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {LANGUAGES.map(({ code, label }) => {
              const selected = (values.languages || []).includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  id={`bd-lang-${code}`}
                  onClick={() => toggleLang(code)}
                  style={{
                    padding: '8px 18px', borderRadius: 30, cursor: 'pointer',
                    border: `1.5px solid ${selected ? '#2ecc71' : '#e5e7eb'}`,
                    background: selected ? 'rgba(46,204,113,0.08)' : 'white',
                    color: selected ? '#16a34a' : '#6b7280',
                    fontWeight: selected ? 600 : 500,
                    fontSize: '0.83rem', fontFamily: 'inherit',
                    transition: 'all 0.18s',
                  }}
                >
                  {selected && '✓ '}{label}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}
