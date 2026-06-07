import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ApptIcon, COLORS, TabBar } from '../components/ApptShared';
import AppointmentList  from '../components/AppointmentList';
import DoctorAppointments from '../components/DoctorAppointments';
import ScheduleManager from '../components/ScheduleManager';
import WaitListPanel   from '../components/WaitListPanel';

export default function AppointmentsPage() {
  const { user } = useAuth();

  const role      = user?.role?.toUpperCase() || 'PATIENT';
  const patientId = user?.id || user?.userId || 'patient-1';
  const doctorId  = user?.id || user?.userId || 'doctor-1';

  const isDoctor  = role === 'DOCTOR';
  const isPatient = role === 'PATIENT' || role === 'USER';

  useEffect(() => {
    if (!isDoctor) return;
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.fullName || user?.name || 'douae lashab';
    localStorage.setItem('MedConnect_last_doctor_name', name);
  }, [isDoctor, user]);

  // Build tabs based on role
  const PATIENT_TABS = [
    { key: 'appointments', label: 'Mes rendez-vous', icon: 'calendar', color: COLORS.primary },
    { key: 'waitlist',     label: 'Liste d\'attente', icon: 'wait',     color: '#6366f1' },
  ];

  const DOCTOR_TABS = [
    { key: 'agenda',    label: 'Mon agenda',    icon: 'calendar',  color: COLORS.primary },
    { key: 'schedule',  label: 'Mon planning',  icon: 'schedule',  color: '#6366f1'      },
  ];

  const tabs = isDoctor ? DOCTOR_TABS : PATIENT_TABS;
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
          .appt-page * { box-sizing: border-box; }
        `}
      </style>
      <div className="appt-page">

        {/* Tab bar â€” only show when user has multiple tabs */}
        {tabs.length > 1 && (
          <div style={{ marginBottom: 24 }}>
            <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
          </div>
        )}

        {/* Patient views */}
        {isPatient && (
          <>
            {activeTab === 'appointments' && (
              <AppointmentList patientId={patientId} />
            )}
            {activeTab === 'waitlist' && (
              <WaitListPanel patientId={patientId} />
            )}
          </>
        )}

        {/* Doctor views */}
        {isDoctor && (
          <>
            {activeTab === 'agenda' && (
              <DoctorAppointments doctorId={doctorId} />
            )}
            {activeTab === 'schedule' && (
              <ScheduleManager doctorId={doctorId} />
            )}
          </>
        )}

        {/* Fallback â€” render both if role unknown */}
        {!isPatient && !isDoctor && (
          <AppointmentList patientId={patientId} />
        )}
      </div>
    </div>
  );
}

