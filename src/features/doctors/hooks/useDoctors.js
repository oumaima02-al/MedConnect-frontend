import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';

export function useDoctorSearch() {
  const [filters, setFilters] = useState({
    specialization: '',
    hospital:       '',
    query:          '',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctors', 'search', filters],
    queryFn: async () => {
      const res = await doctorService.search(filters);
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
    enabled: true, // load on mount
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ specialization: '', hospital: '', query: '' });
  };

  return {
    doctors:      data || [],
    isLoading,
    isError,
    filters,
    updateFilter,
    resetFilters,
    refetch,
  };
}