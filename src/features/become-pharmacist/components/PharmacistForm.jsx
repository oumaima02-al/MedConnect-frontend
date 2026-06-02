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

export default function PharmacistForm({ values, onChange, errors }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>

      {/* Registration number */}
      <Field label="Numéro d'inscription professionnelle" required error={errors.professionalRegistrationNumber}>
        <input
          id="bp-reg-number"
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
          id="bp-national-id"
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
          id="bp-authority"
          type="text"
          placeholder="Ex: Ordre des Pharmaciens du Maroc"
          value={values.registrationAuthority}
          onChange={(e) => onChange({ registrationAuthority: e.target.value })}
          style={inputStyle(false)}
        />
      </Field>

      {/* Pharmacy */}
      <Field label="Nom de la pharmacie" required error={errors.pharmacyName}>
        <input
          id="bp-pharmacy"
          type="text"
          placeholder="Ex: Pharmacie Centrale"
          value={values.pharmacyName}
          onChange={(e) => onChange({ pharmacyName: e.target.value })}
          style={inputStyle(!!errors.pharmacyName)}
        />
      </Field>

      {/* City */}
      <Field label="Ville" required error={errors.city}>
        <input
          id="bp-city"
          type="text"
          placeholder="Ex: Casablanca"
          value={values.city}
          onChange={(e) => onChange({ city: e.target.value })}
          style={inputStyle(!!errors.city)}
        />
      </Field>

      {/* Opening Hours */}
      <Field label="Horaires d'ouverture" error={errors.openingHours}>
        <input
          id="bp-hours"
          type="text"
          placeholder="Ex: Lun-Sam, 08h30 - 20h00"
          value={values.openingHours}
          onChange={(e) => onChange({ openingHours: e.target.value })}
          style={inputStyle(false)}
        />
      </Field>

      {/* Delivery Available — full width */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          id="bp-delivery"
          type="checkbox"
          checked={values.deliveryAvailable}
          onChange={(e) => onChange({ deliveryAvailable: e.target.checked })}
          style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2ecc71' }}
        />
        <label htmlFor="bp-delivery" style={{ fontSize: '0.88rem', color: '#374151', cursor: 'pointer', userSelect: 'none' }}>
          La livraison à domicile est disponible
        </label>
      </div>
    </div>
  );
}
