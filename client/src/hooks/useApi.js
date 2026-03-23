import { useState, useEffect } from 'react';
import { api, withErrorHandling } from '../data/api.js';

// Generic hook for API calls
export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await withErrorHandling(apiCall)();
        
        if (!cancelled) {
          if (result.success) {
            setData(result.data);
          } else {
            setError(result.error);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
}

// Specific hooks for common API calls
export function useTrips(filters = {}) {
  return useApi(() => api.getTrips(filters), [JSON.stringify(filters)]);
}

export function useTrip(slug) {
  return useApi(() => api.getTrip(slug), [slug]);
}

export function useGalleryImages(tag = null) {
  return useApi(() => api.getGalleryImages(tag), [tag]);
}

export function useBlogPosts() {
  return useApi(() => api.getBlogPosts(), []);
}

export function useBlogPost(slug) {
  return useApi(() => api.getBlogPost(slug), [slug]);
}

export function useSiteContent() {
  return useApi(() => api.getSiteContent(), []);
}

// Hook for form submissions
export function useSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const result = await withErrorHandling(apiCall)();

      if (result.success) {
        setSuccess(true);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return { submit, loading, error, success, reset };
}