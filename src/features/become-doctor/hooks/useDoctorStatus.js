import { useState, useEffect } from 'react';
import { doctorService } from '../../doctors/services/doctorService';

/**
 * Fetches the doctor application status for the current user.
 * Returns { status, isLoading, isError, refetch }
 * status: null | 'PENDING' | 'VERIFIED' | 'REJECTED'
 */
export function useDoctorStatus(userId) {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetch = async () => {
    if (!userId) { setIsLoading(false); return; }
    setIsLoading(true);
    setIsError(false);
    try {
      const { data } = await doctorService.getProfile(userId);
      // Backend returns profile with status field
      const profile = data?.data || data;
      setStatus(profile?.status || (profile?.verified ? 'VERIFIED' : 'PENDING'));
    } catch (err) {
      // 404 means no application submitted yet
      if (err?.response?.status === 404) {
        setStatus(null);
      } else {
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [userId]);

  return { status, isLoading, isError, refetch: fetch };
}
