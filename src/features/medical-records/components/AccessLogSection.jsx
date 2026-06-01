import { useAccessLog } from '../hooks/useDMP';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner, fmtDate, Icon,
} from './DMPShared';

const TYPE_COLOR  = { READ: '#1d4ed8', WRITE: '#7c3aed', DELETE: '#dc2626' };
const STATUS_LABEL = { SUCCESS: 'Succès', FAILURE: 'Échec' };

export default function AccessLogSection({ patientId }) {
  const { data: logs, loading, error } = useAccessLog(patientId);
  const list = Array.isArray(logs) ? logs : [];

  return (
    <Card>
      <SectionHeader icon="log" title="Journal d'accès" count={list.length} color="#6b7280" />
      {loading && <Skeleton rows={4} />}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && list.length === 0 && (
        <EmptyState icon="log" message="Aucun accès enregistré" />
      )}
      {!loading && list.map((l, i) => (
        <DataRow key={l.id || i}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginRight: 14,
            background: l.status === 'FAILURE' ? '#fef2f2' : '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="eye" size={16} color={l.status === 'FAILURE' ? '#dc2626' : '#059669'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.88rem' }}>
              {l.accessedBy}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: 2, display: 'flex', gap: 8 }}>
              <span>{fmtDate(l.accessedAt)}</span>
              {l.ipAddress && <span>IP: {l.ipAddress}</span>}
              {l.reason && <span>{l.reason}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{
              padding: '2px 9px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
              background: `${TYPE_COLOR[l.accessType] || '#6b7280'}18`,
              color: TYPE_COLOR[l.accessType] || '#6b7280',
              border: `1px solid ${TYPE_COLOR[l.accessType] || '#6b7280'}30`,
            }}>
              {l.accessType}
            </span>
            <Badge label={STATUS_LABEL[l.status] || l.status} variant={l.status} />
          </div>
        </DataRow>
      ))}
    </Card>
  );
}
