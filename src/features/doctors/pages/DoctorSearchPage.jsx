import { useTranslation } from 'react-i18next';
import { useDoctorSearch } from '../hooks/useDoctors';
import DoctorCard from '../components/DoctorCard';

const SPECIALIZATIONS = [
  'Cardiologie', 'Dermatologie', 'Gynécologie',
  'Neurologie', 'Ophtalmologie', 'Pédiatrie',
  'Psychiatrie', 'Radiologie', 'Chirurgie',
  'Médecine générale',
];

const SkeletonCard = () => (
  <div style={{
    background: 'white', borderRadius: 18, padding: 24,
    border: '1px solid #f3f4f6',
  }}>
    {[60, 20, 16, 16, 36].map((h, i) => (
      <div key={i} style={{
        height: h, borderRadius: 10, marginBottom: 12,
        background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        width: i === 1 ? '60%' : '100%',
      }} />
    ))}
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
  </div>
);

export default function DoctorSearchPage() {
  const { t } = useTranslation();
  const {
    doctors, isLoading, isError,
    filters, updateFilter, resetFilters,
  } = useDoctorSearch();

  const hasFilters = filters.specialization || filters.hospital || filters.query;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Sora',sans-serif",
          fontSize: '1.5rem', fontWeight: 700,
          color: '#111827', marginBottom: 4,
        }}>
          {t('doctors.title')}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
          {t('doctors.subtitle')}
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{
        background: 'white', borderRadius: 18,
        border: '1px solid #f3f4f6',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        padding: '20px 24px',
        marginBottom: 24,
      }}>
        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
            width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={filters.query}
            onChange={e => updateFilter('query', e.target.value)}
            placeholder={t('doctors.search_placeholder')}
            style={{
              width: '100%', padding: '12px 14px 12px 42px',
              border: '1.5px solid #e5e7eb', borderRadius: 12,
              fontSize: '0.9rem', outline: 'none',
              background: '#fafafa', fontFamily: 'inherit', color: '#111827',
              transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#2ecc71'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Filters row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>

          {/* Specialization */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('doctors.specialization')}
            </label>
            <select
              value={filters.specialization}
              onChange={e => updateFilter('specialization', e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid #e5e7eb', borderRadius: 10,
                fontSize: '0.87rem', outline: 'none',
                background: '#fafafa', fontFamily: 'inherit', color: '#374151',
                cursor: 'pointer', boxSizing: 'border-box',
              }}
            >
              <option value="">{t('doctors.all_specializations')}</option>
              {SPECIALIZATIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Hospital */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('doctors.hospital')}
            </label>
            <input
              type="text"
              value={filters.hospital}
              onChange={e => updateFilter('hospital', e.target.value)}
              placeholder={t('doctors.hospital_placeholder')}
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid #e5e7eb', borderRadius: 10,
                fontSize: '0.87rem', outline: 'none',
                background: '#fafafa', fontFamily: 'inherit', color: '#374151',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#2ecc71'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={resetFilters}
              style={{
                padding: '10px 18px',
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, fontSize: '0.83rem',
                fontWeight: 600, color: '#dc2626',
                cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {t('common.reset')}
            </button>
          )}
        </div>

        {/* Active filters chips */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {filters.specialization && (
              <span style={{
                background: 'rgba(46,204,113,0.08)', color: '#16a34a',
                border: '1px solid rgba(46,204,113,0.2)',
                padding: '3px 10px', borderRadius: 20,
                fontSize: '0.78rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {filters.specialization}
                <button onClick={() => updateFilter('specialization', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
              </span>
            )}
            {filters.hospital && (
              <span style={{
                background: '#eff6ff', color: '#1e40af',
                border: '1px solid #bfdbfe',
                padding: '3px 10px', borderRadius: 20,
                fontSize: '0.78rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {filters.hospital}
                <button onClick={() => updateFilter('hospital', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {!isLoading && !isError && (
        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: 18 }}>
          {doctors.length > 0
            ? t('doctors.results_count', { count: doctors.length })
            : t('doctors.no_results')}
        </p>
      )}

      {/* Error */}
      {isError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 14, padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: '0.88rem', color: '#dc2626', fontWeight: 500 }}>
            {t('doctors.error_load')}
          </p>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {isLoading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : doctors.length > 0
            ? doctors.map((doc, i) => <DoctorCard key={doc.id || i} doctor={doc} />)
            : !isLoading && (
              <div style={{
                gridColumn: '1 / -1', textAlign: 'center',
                padding: '60px 20px',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {t('doctors.no_results')}
                </p>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  {t('doctors.no_results_sub')}
                </p>
              </div>
            )
        }
      </div>
    </div>
  );
}