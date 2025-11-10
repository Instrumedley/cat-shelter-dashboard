import useSWR from 'swr';
import { fetcher } from '../services/api';
import {
  TotalAdoptionsResponse,
  CatsStatusResponse,
  IncomingCatsResponse,
  NeuteredCatsResponse,
  CampaignResponse,
} from '../types';

/**
 * Hook to fetch total adoptions with optional date filtering
 */
export const useTotalAdoptions = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const queryString = params.toString();
  const key = `/total_adoptions${queryString ? `?${queryString}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR<TotalAdoptionsResponse>(
    key,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

/**
 * Hook to fetch cat status information
 */
export const useCatsStatus = () => {
  const { data, error, isLoading, mutate } = useSWR<CatsStatusResponse>(
    '/cats_status',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

/**
 * Hook to fetch incoming cats data (staff/admin only)
 */
export const useIncomingCats = () => {
  const { data, error, isLoading, mutate } = useSWR<IncomingCatsResponse>(
    '/incoming_cats',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      shouldRetryOnError: (error) => {
        // Don't retry on 403 (forbidden) errors
        return error?.response?.status !== 403;
      },
    }
  );

  return {
    data,
    error: error?.response?.status === 403 ? null : error,
    isLoading,
    mutate,
  };
};

/**
 * Hook to fetch neutered/spayed cats data (staff/admin only)
 */
export const useNeuteredCats = () => {
  const { data, error, isLoading, mutate } = useSWR<NeuteredCatsResponse>(
    '/neutered_cats',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      shouldRetryOnError: (error) => {
        // Don't retry on 403 (forbidden) errors
        return error?.response?.status !== 403;
      },
    }
  );

  return {
    data,
    error: error?.response?.status === 403 ? null : error,
    isLoading,
    mutate,
  };
};

/**
 * Hook to fetch campaign information
 */
export const useCampaign = () => {
  const { data, error, isLoading, mutate } = useSWR<CampaignResponse | null>(
    '/campaign',
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
