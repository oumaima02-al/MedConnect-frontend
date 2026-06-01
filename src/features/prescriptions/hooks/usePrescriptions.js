import { useState, useEffect, useCallback } from 'react';
import * as rx from '../services/prescriptionService';

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
// PATIENT PRESCRIPTIONS LIST
// ──────────────────────────────────────────────────────────────
export function usePatientPrescriptions(patientId) {
  const state = useFetch(() => rx.getPatientRx(patientId), [patientId]);

  const create = async (payload) => {
    const res = await rx.createPrescription(payload);
    state.refresh();
    return res.data?.data;
  };

  const cancel = async (id) => {
    await rx.cancelPrescription(id);
    state.refresh();
  };

  return { ...state, create, cancel };
}

// ──────────────────────────────────────────────────────────────
// SINGLE PRESCRIPTION DETAIL (lazy — call load() on demand)
// ──────────────────────────────────────────────────────────────
export function usePrescriptionDetail(rxId) {
  const state = useFetch(() => rx.getPrescription(rxId), [rxId]);

  const update = async (payload) => {
    const res = await rx.updatePrescription(rxId, payload);
    state.refresh();
    return res.data?.data;
  };

  const addItemFn = async (payload) => {
    const res = await rx.addItem(rxId, payload);
    state.refresh();
    return res.data?.data;
  };

  const updateItemFn = async (itemId, payload) => {
    const res = await rx.updateItem(rxId, itemId, payload);
    state.refresh();
    return res.data?.data;
  };

  const deleteItemFn = async (itemId) => {
    await rx.deleteItem(rxId, itemId);
    state.refresh();
  };

  return { ...state, update, addItemFn, updateItemFn, deleteItemFn };
}

// ──────────────────────────────────────────────────────────────
// REFILLS
// ──────────────────────────────────────────────────────────────
export function useRefills(rxId) {
  const state = useFetch(() => rx.getRefillHistory(rxId), [rxId]);

  const request = async (payload) => {
    const res = await rx.requestRefill(rxId, payload);
    state.refresh();
    return res.data?.data;
  };

  const updateStatus = async (payload) => {
    const res = await rx.updateRefillStatus(rxId, payload);
    state.refresh();
    return res.data?.data;
  };

  return { ...state, request, updateStatus };
}

// ──────────────────────────────────────────────────────────────
// PHARMACIES
// ──────────────────────────────────────────────────────────────
export function usePharmacies() {
  return useFetch(() => rx.getPharmacies(), []);
}

export function usePharmacyStatus(rxId) {
  return useFetch(() => rx.getPharmacyStatus(rxId), [rxId]);
}

// ──────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────────────────────────
export function useNotifications() {
  const state = useFetch(() => rx.getNotifications(), []);

  const acknowledge = async (ids) => {
    await rx.acknowledgeNotifs(ids);
    state.refresh();
  };

  const ackAll = async () => {
    const unread = (Array.isArray(state.data) ? state.data : [])
      .filter(n => !n.isRead).map(n => n.id);
    if (unread.length) await acknowledge(unread);
  };

  return { ...state, acknowledge, ackAll };
}

// ──────────────────────────────────────────────────────────────
// SEARCH
// ──────────────────────────────────────────────────────────────
export function usePrescriptionSearch() {
  const [filters, setFilters] = useState({ patientId: '', doctorId: '', status: '', startDate: '', endDate: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const search = useCallback(async (params = filters) => {
    setLoading(true);
    setError(null);
    try {
      const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
      const res = await rx.searchPrescriptions(clean);
      setResults(res.data?.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur de recherche');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const reset = () => { setFilters({ patientId: '', doctorId: '', status: '', startDate: '', endDate: '' }); setResults(null); };

  return { filters, updateFilter, reset, results, loading, error, search };
}
