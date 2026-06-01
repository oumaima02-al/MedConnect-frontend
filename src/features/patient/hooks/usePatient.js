import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import { useAuth } from '../../../context/AuthContext';

// ─── GET patient profile ──────────────────────────────────
export function usePatientProfile() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patient', 'profile', userId],
    queryFn: async () => {
      const res = await patientService.getProfile(userId);
      return res.data?.data || res.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { patientProfile: data, isLoading, isError, error };
}

// ─── CREATE patient profile ───────────────────────────────
export function useCreatePatientProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) =>
      patientService.createProfile({ userId: user?.id, ...data }),
    onSuccess: (res) => {
      const created = res.data?.data || res.data;
      queryClient.setQueryData(['patient', 'profile', user?.id], created);
      queryClient.invalidateQueries(['patient', 'profile']);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return {
    createPatientProfile: mutation.mutate,
    isLoading: mutation.isPending,
    isError:   mutation.isError,
    error:     mutation.error?.response?.data?.error || mutation.error?.message || '',
    success,
  };
}

// ─── UPDATE patient profile ───────────────────────────────
export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) =>
      patientService.updateProfile(user?.id, data),
    onSuccess: (res) => {
      const updated = res.data?.data || res.data;
      queryClient.setQueryData(['patient', 'profile', user?.id], updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return {
    updatePatientProfile: mutation.mutate,
    isLoading: mutation.isPending,
    isError:   mutation.isError,
    error:     mutation.error?.response?.data?.error || mutation.error?.message || '',
    success,
  };
}
