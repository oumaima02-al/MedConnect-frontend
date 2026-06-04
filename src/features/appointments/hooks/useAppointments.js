import { useState, useEffect, useCallback } from 'react';
import * as appt from '../services/appointmentService';
import { doctorService } from '../../doctors/services/doctorService';
import { adminService } from '../../admin/services/adminService';

// ─── Generic fetch hook ───────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────
// PATIENT APPOINTMENTS
// ──────────────────────────────────────────────────────────────
export function usePatientAppointments(patientId) {
  const state = useFetch(() => appt.getPatientAppointments(patientId), [patientId]);

  const book = async (payload) => {
    const res = await appt.bookAppointment(payload);
    state.refresh();
    return res.data;
  };

  const cancel = async (id, reason) => {
    await appt.cancelAppointment(id, reason);
    state.refresh();
  };

  const reschedule = async (id, newDateTime) => {
    const res = await appt.rescheduleAppointment(id, newDateTime);
    state.refresh();
    return res.data;
  };

  return { ...state, book, cancel, reschedule };
}

// ──────────────────────────────────────────────────────────────
// DOCTOR APPOINTMENTS
// ──────────────────────────────────────────────────────────────
export function useDoctorAppointments(doctorId) {
  const state = useFetch(() => appt.getDoctorAppointments(doctorId), [doctorId]);

  const noShow = async (id) => {
    await appt.markNoShow(id);
    state.refresh();
  };

  return { ...state, noShow };
}

// ──────────────────────────────────────────────────────────────
// SINGLE APPOINTMENT
// ──────────────────────────────────────────────────────────────
export function useAppointmentDetail(id) {
  return useFetch(() => appt.getAppointment(id), [id]);
}

// ──────────────────────────────────────────────────────────────
// AVAILABLE SLOTS
// ──────────────────────────────────────────────────────────────
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
      setSlots(res.data?.data ?? res.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Impossible de charger les créneaux');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (doctorId && date) fetchSlots(doctorId, date);
  }, [doctorId, date, fetchSlots]);

  return { slots, loading, error, fetchSlots };
}

// ──────────────────────────────────────────────────────────────
// DOCTOR SCHEDULE
// ──────────────────────────────────────────────────────────────
export function useDoctorSchedule(doctorId) {
  const state = useFetch(() => appt.getSchedule(doctorId), [doctorId]);

  const create = async (payload) => {
    const res = await appt.createSchedule(doctorId, payload);
    state.refresh();
    return res.data;
  };

  const update = async (payload) => {
    const res = await appt.updateSchedule(doctorId, payload);
    state.refresh();
    return res.data;
  };

  const addVacation = async (payload) => {
    await appt.addVacation(doctorId, payload);
    state.refresh();
  };

  const removeVacation = async (vacId) => {
    await appt.removeVacation(doctorId, vacId);
    state.refresh();
  };

  return { ...state, create, update, addVacation, removeVacation };
}

// ──────────────────────────────────────────────────────────────
// QUEUE POSITION
// ──────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────
// WAIT LIST
// ──────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────
// FEEDBACK (submit-only)
// ──────────────────────────────────────────────────────────────
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
// ──────────────────────────────────────────────────────────────
// DOCTORS FETCHING
// ──────────────────────────────────────────────────────────────
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
          id: d.userId, // The UI expects `id`
          nom: d.nom, // You may need to fetch the user details if not included, but for now we assume it's either in the profile or not strictly required for the list to render without crashing
          prenom: d.prenom,
          profile: d // The whole response is the profile
        }));
        
        setDoctors(enhanced);
      } catch (e) {
        setError("Erreur lors de la récupération des médecins");
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
