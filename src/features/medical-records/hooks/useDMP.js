import { useState, useEffect, useCallback } from 'react';
import * as dmp from '../services/dmpService';

// ─── Generic data-fetching hook ───────────────────────────────
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
// DMP SUMMARY
// ──────────────────────────────────────────────────────────────
export function useDMPSummary(patientId) {
  return useFetch(() => dmp.getSummary(patientId), [patientId]);
}

// ──────────────────────────────────────────────────────────────
// ALLERGIES
// ──────────────────────────────────────────────────────────────
export function useAllergies(patientId) {
  const state = useFetch(() => dmp.getAllergies(patientId), [patientId]);

  const add = async (payload) => {
    const res = await dmp.addAllergy(patientId, payload);
    state.refresh();
    return res.data?.data;
  };
  const update = async (id, payload) => {
    const res = await dmp.updateAllergy(patientId, id, payload);
    state.refresh();
    return res.data?.data;
  };
  const remove = async (id) => {
    await dmp.deleteAllergy(patientId, id);
    state.refresh();
  };

  return { ...state, add, update, remove };
}

// ──────────────────────────────────────────────────────────────
// MEDICATIONS
// ──────────────────────────────────────────────────────────────
export function useMedications(patientId) {
  const state = useFetch(() => dmp.getMedications(patientId), [patientId]);

  const add = async (payload) => {
    const res = await dmp.addMedication(patientId, payload);
    state.refresh();
    return res.data?.data;
  };
  const update = async (id, payload) => {
    const res = await dmp.updateMedication(patientId, id, payload);
    state.refresh();
    return res.data?.data;
  };
  const stop = async (id) => {
    await dmp.stopMedication(patientId, id);
    state.refresh();
  };

  return { ...state, add, update, stop };
}

// ──────────────────────────────────────────────────────────────
// CHRONIC CONDITIONS
// ──────────────────────────────────────────────────────────────
export function useConditions(patientId) {
  const state = useFetch(() => dmp.getConditions(patientId), [patientId]);

  const add = async (payload) => {
    const res = await dmp.addCondition(patientId, payload);
    state.refresh();
    return res.data?.data;
  };
  const update = async (id, payload) => {
    const res = await dmp.updateCondition(patientId, id, payload);
    state.refresh();
    return res.data?.data;
  };
  const remove = async (id) => {
    await dmp.deleteCondition(patientId, id);
    state.refresh();
  };

  return { ...state, add, update, remove };
}

// ──────────────────────────────────────────────────────────────
// CONSULTATIONS
// ──────────────────────────────────────────────────────────────
export function useConsultations(patientId) {
  const state = useFetch(() => dmp.getConsultations(patientId), [patientId]);

  const add = async (payload) => {
    const res = await dmp.addConsultation(patientId, payload);
    state.refresh();
    return res.data?.data;
  };

  return { ...state, add };
}

// ──────────────────────────────────────────────────────────────
// CONSENTS
// ──────────────────────────────────────────────────────────────
export function useConsents(patientId) {
  const state = useFetch(() => dmp.getConsents(patientId), [patientId]);

  const grant = async (payload) => {
    const res = await dmp.grantConsent(patientId, payload);
    state.refresh();
    return res.data?.data;
  };
  const revoke = async (doctorId, reason) => {
    await dmp.revokeConsent(patientId, doctorId, reason);
    state.refresh();
  };

  return { ...state, grant, revoke };
}

// ──────────────────────────────────────────────────────────────
// LAB RESULTS
// ──────────────────────────────────────────────────────────────
export function useLabResults(patientId) {
  const state = useFetch(() => dmp.getLabResults(patientId), [patientId]);

  const add = async (payload) => {
    const res = await dmp.addLabResult(patientId, payload);
    state.refresh();
    return res.data?.data;
  };
  const update = async (id, payload) => {
    const res = await dmp.updateLabResult(patientId, id, payload);
    state.refresh();
    return res.data?.data;
  };

  return { ...state, add, update };
}

// ──────────────────────────────────────────────────────────────
// VACCINATIONS
// ──────────────────────────────────────────────────────────────
export function useVaccinations(patientId) {
  const state = useFetch(() => dmp.getVaccinations(patientId), [patientId]);

  const add = async (payload) => {
    const res = await dmp.addVaccination(patientId, payload);
    state.refresh();
    return res.data?.data;
  };
  const remove = async (id) => {
    await dmp.deleteVaccination(patientId, id);
    state.refresh();
  };

  return { ...state, add, remove };
}

// ──────────────────────────────────────────────────────────────
// DOCUMENTS
// ──────────────────────────────────────────────────────────────
export function useDocuments(patientId) {
  const state = useFetch(() => dmp.getDocuments(patientId), [patientId]);

  const upload = async (payload) => {
    const res = await dmp.uploadDocument(patientId, payload);
    state.refresh();
    return res.data?.data;
  };
  const remove = async (id) => {
    await dmp.deleteDocument(patientId, id);
    state.refresh();
  };

  return { ...state, upload, remove };
}

// ──────────────────────────────────────────────────────────────
// IMAGING
// ──────────────────────────────────────────────────────────────
export function useImaging(patientId) {
  const state = useFetch(() => dmp.getImagingResults(patientId), [patientId]);

  const add = async (payload) => {
    const res = await dmp.addImaging(patientId, payload);
    state.refresh();
    return res.data?.data;
  };
  const update = async (id, payload) => {
    const res = await dmp.updateImaging(patientId, id, payload);
    state.refresh();
    return res.data?.data;
  };

  return { ...state, add, update };
}

// ──────────────────────────────────────────────────────────────
// HEALTH NOTEBOOK
// ──────────────────────────────────────────────────────────────
export function useHealthNotebook(patientId) {
  const state = useFetch(() => dmp.getHealthNotebook(patientId), [patientId]);

  const addEntry = async (payload) => {
    const res = await dmp.addVitals(patientId, payload);
    state.refresh();
    return res.data?.data;
  };

  return { ...state, addEntry };
}

// ──────────────────────────────────────────────────────────────
// ACCESS LOG
// ──────────────────────────────────────────────────────────────
export function useAccessLog(patientId) {
  return useFetch(() => dmp.getAccessLog(patientId), [patientId]);
}

// ──────────────────────────────────────────────────────────────
// ALERTS
// ──────────────────────────────────────────────────────────────
export function useAlerts(patientId) {
  return useFetch(() => dmp.getAlerts(patientId), [patientId]);
}
