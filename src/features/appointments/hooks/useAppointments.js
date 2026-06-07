import { useState, useEffect, useCallback } from 'react';
import * as appt from '../services/appointmentService';
import * as teleconsult from '../../teleconsult/services/teleconsultService';
import { doctorService } from '../../doctors/services/doctorService';
import { adminService } from '../../admin/services/adminService';

const LOCAL_APPOINTMENTS_KEY = 'MedConnect_local_appointments';
const LOCAL_TELECONSULT_SESSIONS_KEY = 'MedConnect_local_teleconsult_sessions';

function readLocalAppointments() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_APPOINTMENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalAppointments(items) {
  localStorage.setItem(LOCAL_APPOINTMENTS_KEY, JSON.stringify(items));
}

function readLocalTeleconsultSessions() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_TELECONSULT_SESSIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalTeleconsultSessions(items) {
  localStorage.setItem(LOCAL_TELECONSULT_SESSIONS_KEY, JSON.stringify(items));
}

function displayNameFromStoredUser(fallback = 'Patient') {
  try {
    const user = JSON.parse(localStorage.getItem('MedConnect_user') || '{}');
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.fullName || user.name || fallback;
  } catch {
    return fallback;
  }
}

function normalizeAppointment(item) {
  const date = new Date(item.dateTime);
  const patientName = item.patientName || item.patientFullName || item.patientFullname || displayNameFromStoredUser('Patient');
  const doctorName = item.doctorName || item.doctorFullName || item.medecinName || localStorage.getItem('MedConnect_last_doctor_name') || 'Medecin';
  return {
    ...item,
    id: item.id || item.appointmentId || `local-appt-${Date.now()}`,
    status: item.status || 'SCHEDULED',
    type: item.type || 'VIDEO',
    patientName,
    doctorName,
    formattedDateTime: Number.isNaN(date.getTime()) ? item.dateTime : date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }),
  };
}

function mergeAppointments(remote, local) {
  const map = new Map();
  [...(remote || []), ...(local || [])].forEach((item) => {
    const normalized = normalizeAppointment(item);
    map.set(normalized.id, normalized);
  });
  return Array.from(map.values());
}


function useFetch(fetchFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data?.data ?? res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}


// PATIENT APPOINTMENTS

export function usePatientAppointments(patientId) {
  const state = useFetch(() => appt.getPatientAppointments(patientId), [patientId]);

  const localForPatient = readLocalAppointments().filter(a => !patientId || a.patientId === patientId);
  const data = mergeAppointments(Array.isArray(state.data) ? state.data : [], localForPatient);

  const refresh = async () => {
    await state.refresh();
  };

  const book = async (payload) => {
    const localItem = normalizeAppointment({
      ...payload,
      id: `local-appt-${Date.now()}`,
      status: 'SCHEDULED',
      patientName: displayNameFromStoredUser('Patient'),
      doctorName: payload.doctorName || localStorage.getItem('MedConnect_last_doctor_name') || 'Medecin',
    });
    const existing = readLocalAppointments();
    writeLocalAppointments([...existing, localItem]);
    try {
      await appt.bookAppointment(payload);
      await state.refresh();
    } catch {
      // Keep the local appointment so the demo workflow remains coherent.
    }
    return localItem;
  };

  const cancel = async (id, reason) => {
    writeLocalAppointments(readLocalAppointments().map(a => a.id === id ? { ...a, status: 'CANCELLED', cancellationReason: reason } : a));
    try { await appt.cancelAppointment(id, reason); await state.refresh(); } catch { /* local fallback */ }
  };

  const reschedule = async (id, newDateTime) => {
    writeLocalAppointments(readLocalAppointments().map(a => a.id === id ? { ...a, dateTime: newDateTime, status: 'SCHEDULED' } : a));
    try { const res = await appt.rescheduleAppointment(id, newDateTime); await state.refresh(); return res.data; } catch { return readLocalAppointments().find(a => a.id === id); }
  };

  return { ...state, data, refresh, book, cancel, reschedule };
}

// DOCTOR APPOINTMENTS

export function useDoctorAppointments(doctorId) {
  const state = useFetch(() => appt.getDoctorAppointments(doctorId), [doctorId]);
  const localForDoctor = readLocalAppointments().filter(a => !doctorId || a.doctorId === doctorId || a.localOnly);
  const data = mergeAppointments(Array.isArray(state.data) ? state.data : [], localForDoctor);

  const updateLocalStatus = (id, status, extra = {}) => {
    writeLocalAppointments(readLocalAppointments().map(a => a.id === id ? { ...a, status, ...extra } : a));
  };

  const createLocalTeleconsultSession = (appointment, forcedSessionId) => {
    if (appointment?.type !== 'VIDEO') return null;
    const existing = readLocalTeleconsultSessions();
    const alreadyCreated = existing.find(s => s.appointmentId === appointment.id);
    if (alreadyCreated) return alreadyCreated;

    const sessionId = forcedSessionId || `local-session-${Date.now()}`;
    const session = {
      id: sessionId,
      sessionId,
      appointmentId: appointment.id,
      doctorId: appointment.doctorId || doctorId,
      patientId: appointment.patientId,
      doctorName: appointment.doctorName,
      patientName: appointment.patientName,
      scheduledAt: appointment.dateTime,
      status: 'SCHEDULED',
      localOnly: true,
    };
    writeLocalTeleconsultSessions([...existing, session]);
    return session;
  };

  const confirm = async (id) => {
    const target = data.find(a => a.id === id);
    let teleconsultSession = null;
    try {
      const res = await appt.confirmAppointment(id);
      const updated = res.data?.data ?? res.data;
      if (target?.type === 'VIDEO' && updated?.teleconsultSessionId) {
        teleconsultSession = createLocalTeleconsultSession(target, updated.teleconsultSessionId);
      }
      await state.refresh();
    } catch {
      if (target?.type === 'VIDEO') {
        teleconsultSession = createLocalTeleconsultSession(target);
        try {
          const res = await teleconsult.createSession({
            appointmentId: id,
            doctorId: target.doctorId || doctorId,
            patientId: target.patientId,
          });
          teleconsultSession = res.data?.data ?? res.data ?? teleconsultSession;
        } catch {
          // Local session keeps the video workflow available when backend is unavailable.
        }
      }
    }

    updateLocalStatus(id, 'CONFIRMED', teleconsultSession ? { teleconsultSessionId: teleconsultSession.sessionId || teleconsultSession.id } : {});
  };

  const reject = async (id) => {
    updateLocalStatus(id, 'REJECTED');
      try {
        await appt.rejectAppointment(id);
        await state.refresh();
      } catch {
        // Local fallback.
      }
  };

  const noShow = async (id) => {
    updateLocalStatus(id, 'NO_SHOW');
    try { await appt.markNoShow(id); await state.refresh(); } catch { /* local fallback */ }
  };

  return { ...state, data, refresh: state.refresh, noShow, confirm, reject };
}

// SINGLE APPOINTMENT

export function useAppointmentDetail(id) {
  return useFetch(() => appt.getAppointment(id), [id]);
}


// AVAILABLE SLOTS

function removeBookedSlots(slots, doctorId, targetDate) {
  const booked = readLocalAppointments().filter(a =>
    (!doctorId || a.doctorId === doctorId) &&
    a.dateTime?.startsWith(targetDate) &&
    !['CANCELLED', 'REJECTED', 'NO_SHOW'].includes(a.status)
  );
  const bookedTimes = new Set(booked.map(a => a.dateTime?.slice(11, 16)));
  return slots.map(slot => ({ ...slot, isAvailable: !bookedTimes.has(slot.startTime) }));
}

function buildSlotsFromSchedule(schedule, targetDate, doctorId) {
  if (!targetDate) return [];
  const effectiveSchedule = schedule?.workDays?.length ? schedule : {
    workDays: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'],
    startTime: '08:00',
    endTime: '17:00',
    lunchStart: '12:00',
    lunchEnd: '13:00',
    appointmentDurationMinutes: 30,
  };
  const day = new Date(targetDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  // Demo fallback: if the backend is unavailable, keep slots visible for the selected date.
  // The saved planning still provides the hours and appointment duration.

  const toMinutes = (time) => {
    const [h, m] = String(time || '00:00').split(':').map(Number);
    return h * 60 + m;
  };
  const toTime = (minutes) => {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  const start = toMinutes(effectiveSchedule.startTime);
  const end = toMinutes(effectiveSchedule.endTime);
  const lunchStart = toMinutes(effectiveSchedule.lunchStart);
  const lunchEnd = toMinutes(effectiveSchedule.lunchEnd);
  const duration = Number(effectiveSchedule.appointmentDurationMinutes) || 30;
  const slots = [];

  for (let current = start; current + duration <= end; current += duration) {
    const slotEnd = current + duration;
    const inLunch = current < lunchEnd && slotEnd > lunchStart;
    if (!inLunch) {
      slots.push({
        id: `${targetDate}-${current}`,
        startTime: toTime(current),
        endTime: toTime(slotEnd),
        isAvailable: true,
        localOnly: true,
      });
    }
  }
  return removeBookedSlots(slots, schedule?.doctorId || doctorId, targetDate);
}

function readLocalDoctorSchedule(doctorId) {
  const parseSchedule = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const last = parseSchedule('MedConnect_last_doctor_schedule');
  if (last?.workDays?.length) return last;

  if (doctorId) {
    const exact = parseSchedule(`MedConnect_doctor_schedule_${doctorId}`);
    if (exact) return exact;
  }

  for (let idx = 0; idx < localStorage.length; idx += 1) {
    const key = localStorage.key(idx);
    if (key?.startsWith('MedConnect_doctor_schedule_')) {
      const schedule = parseSchedule(key);
      if (schedule?.workDays?.length) return schedule;
    }
  }
  return null;
}

export function useAvailableSlots(doctorId, date) {
  const [slots, setSlots]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchSlots = useCallback(async (dId, d) => {
    if (!dId || !d) return;
    setLoading(true);
    setError(null);
    try {
      const res = await appt.getAvailableSlots(dId, d);
      const remoteSlots = res.data?.data ?? res.data ?? [];
      if (Array.isArray(remoteSlots) && remoteSlots.length > 0) {
        setSlots(removeBookedSlots(remoteSlots, dId, d));
      } else {
        setSlots(buildSlotsFromSchedule(readLocalDoctorSchedule(dId), d, dId));
      }
    } catch (e) {
      const localSlots = buildSlotsFromSchedule(readLocalDoctorSchedule(dId), d, dId);
      setSlots(localSlots);
      setError(localSlots.length ? null : 'Aucun creneau disponible pour cette date.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (doctorId && date) fetchSlots(doctorId, date);
  }, [doctorId, date, fetchSlots]);

  return { slots, loading, error, fetchSlots };
}

// DOCTOR SCHEDULE

export function useDoctorSchedule(doctorId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storageKey = doctorId ? `MedConnect_doctor_schedule_${doctorId}` : null;

  const readLocalSchedule = useCallback(() => {
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const saveLocalSchedule = useCallback((payload) => {
    const schedule = {
      id: payload.id || `local-${doctorId}` ,
      doctorId,
      workDays: payload.workDays || [],
      startTime: payload.startTime,
      endTime: payload.endTime,
      lunchStart: payload.lunchStart,
      lunchEnd: payload.lunchEnd,
      appointmentDurationMinutes: Number(payload.appointmentDurationMinutes),
      vacationPeriods: payload.vacationPeriods || readLocalSchedule()?.vacationPeriods || [],
      localOnly: true,
    };
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(schedule));
    localStorage.setItem('MedConnect_last_doctor_schedule', JSON.stringify(schedule));
    setData(schedule);
    return schedule;
  }, [doctorId, readLocalSchedule, storageKey]);

  const load = useCallback(async () => {
    if (!doctorId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await appt.getSchedule(doctorId);
      const schedule = res.data?.data ?? res.data;
      setData(schedule);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(schedule));
      localStorage.setItem('MedConnect_last_doctor_schedule', JSON.stringify(schedule));
    } catch (e) {
      const localSchedule = readLocalSchedule();
      if (e?.response?.status === 404 || localSchedule) {
        setData(localSchedule);
      } else {
        setError(e?.response?.data?.message || 'Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  }, [doctorId, readLocalSchedule, storageKey]);

  useEffect(() => { load(); }, [load]);

  const create = async (payload) => {
    try {
      const res = await appt.createSchedule(doctorId, payload);
      const schedule = res.data?.data ?? res.data;
      setData(schedule);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(schedule));
      localStorage.setItem('MedConnect_last_doctor_schedule', JSON.stringify(schedule));
      return schedule;
    } catch (e) {
      if (e?.response?.status === 409) return update(payload);
      return saveLocalSchedule(payload);
    }
  };

  const update = async (payload) => {
    try {
      const res = await appt.updateSchedule(doctorId, payload);
      const schedule = res.data?.data ?? res.data;
      setData(schedule);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(schedule));
      localStorage.setItem('MedConnect_last_doctor_schedule', JSON.stringify(schedule));
      return schedule;
    } catch (e) {
      if (e?.response?.status === 404) {
        try { return await create(payload); } catch { return saveLocalSchedule(payload); }
      }
      return saveLocalSchedule(payload);
    }
  };

  const addVacation = async (payload) => {
    try {
      await appt.addVacation(doctorId, payload);
      await load();
    } catch {
      const current = readLocalSchedule() || data || { doctorId, workDays: [], vacationPeriods: [] };
      const vacation = { ...payload, id: `vac-${Date.now()}` };
      saveLocalSchedule({ ...current, vacationPeriods: [...(current.vacationPeriods || []), vacation] });
    }
  };

  const removeVacation = async (vacId) => {
    try {
      await appt.removeVacation(doctorId, vacId);
      await load();
    } catch {
      const current = readLocalSchedule() || data;
      if (current) saveLocalSchedule({ ...current, vacationPeriods: (current.vacationPeriods || []).filter(v => v.id !== vacId) });
    }
  };

  return { data, loading, error, refresh: load, create, update, addVacation, removeVacation };
}

// QUEUE POSITION

export function useQueuePosition(appointmentId) {
  const [queue, setQueue]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchPosition = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    try {
      const res = await appt.getQueuePosition(appointmentId);
      setQueue(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Position non disponible');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  const doCheckIn = async () => {
    const res = await appt.checkIn(appointmentId);
    setQueue(res.data);
    return res.data;
  };

  return { queue, loading, error, fetchPosition, doCheckIn };
}


// WAIT LIST

export function useWaitList(patientId, doctorId) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetchPosition = useCallback(async () => {
    if (!patientId || !doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await appt.getWaitListPosition(patientId, doctorId);
      setPosition(res.data?.position ?? res.data);
    } catch (e) {
      if (e?.response?.status === 404) setPosition(null);
      else setError(e?.response?.data?.message || 'Erreur liste d\'attente');
    } finally {
      setLoading(false);
    }
  }, [patientId, doctorId]);

  const join = async (requestedDate) => {
    await appt.addToWaitList({ patientId, doctorId, requestedDate });
    fetchPosition();
  };

  const leave = async () => {
    await appt.removeFromWaitList(patientId, doctorId);
    setPosition(null);
  };

  return { position, loading, error, fetchPosition, join, leave };
}


// FEEDBACK (submit-only)

export function useFeedback() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = async (appointmentId, payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await appt.submitFeedback(appointmentId, payload);
      setSuccess(true);
      return res.data;
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur lors de l\'envoi du feedback');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, submit };
}

// DOCTORS FETCHING

export function useDoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function fetchDocs() {
      setLoading(true);
      try {
        // Use the public search endpoint instead of the admin-only getUsers
        const res = await doctorService.search();
        const docs = res.data?.data || res.data || [];
        
        // Map the search results into the format expected by the UI.
        // The search endpoint already returns doctor profiles, so we don't need to fetch them individually.
        const enhanced = docs.map(d => ({
          id: d.userId || d.id || d.doctorId || d.profile?.userId,
          nom: d.nom || d.lastName || d.profile?.nom || d.profile?.lastName,
          prenom: d.prenom || d.firstName || d.profile?.prenom || d.profile?.firstName,
          profile: d // The whole response is the profile
        }));
        
        setDoctors(enhanced);
      } catch (e) {
        setError("Erreur lors de la recuperation des medecins");
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  return { doctors, loading, error };
}

export function useSearchDoctor(doctorId) {
  return useFetch(() => doctorService.getProfile(doctorId), [doctorId]);
}






