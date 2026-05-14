import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { useAuth } from '../../../context/AuthContext';

// ─── GET profile ──────────────────────────────────────────
export function useProfile() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await profileService.getMe();
      return res.data?.data || res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 min cache — no redundant calls
    retry: 1,
  });

  return { profile: data, isLoading, isError, error };
}

// ─── UPDATE profile ───────────────────────────────────────
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { login, user }   = useAuth();
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (formData) => profileService.updateMe(formData),
    onSuccess: (res) => {
      const updated = res.data?.data || res.data;
      // Update cache instantly
      queryClient.setQueryData(['profile', 'me'], updated);
      // Update AuthContext so navbar/sidebar reflects new name
      const token = localStorage.getItem('dawini_access_token');
      login({ ...user, ...updated }, token);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return {
    updateProfile: mutation.mutate,
    isLoading:     mutation.isPending,
    isError:       mutation.isError,
    error:         mutation.error?.response?.data?.error || mutation.error?.message || '',
    success,
  };
}