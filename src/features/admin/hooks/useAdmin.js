import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

// ─── useAdminUsers ─────────────────────────────────────────────────────────
export function useAdminUsers() {
  const [page,    setPage]    = useState(0);
  const [filters, setFilters] = useState({ query: '', role: '', enabled: '' });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', page, filters],
    queryFn: async () => {
      const res = await adminService.getUsers({ page, size: 20, ...filters });
      return res.data?.data || res.data || { content: [], totalElements: 0 };
    },
    staleTime: 1000 * 30,
    keepPreviousData: true,
  });

  const updateFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const resetFilters = () =>
    setFilters({ query: '', role: '', enabled: '' });

  return {
    users:         data?.content || data || [],
    total:         data?.totalElements || 0,
    page, setPage,
    filters, updateFilter, resetFilters,
    isLoading, isError,
  };
}

// ─── useAdminUserActions ───────────────────────────────────────────────────
export function useAdminUserActions() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const deleteUser = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: invalidate,
  });

  const suspendUser = useMutation({
    mutationFn: (id) => adminService.suspendUser(id),
    onSuccess: invalidate,
  });

  const createUser = useMutation({
    mutationFn: (data) => adminService.createUser(data),
    onSuccess: invalidate,
  });

  const updateUser = useMutation({
    mutationFn: ({ id, ...data }) => adminService.updateUser(id, data),
    onSuccess: invalidate,
  });

  return { deleteUser, suspendUser, createUser, updateUser };
}
