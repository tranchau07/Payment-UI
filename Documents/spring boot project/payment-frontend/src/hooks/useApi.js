import { useState, useCallback } from 'react';

export function useApi(apiFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError('');

      try {
        const response = await apiFn(...args);
        setData(response.data);
        return response;
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể kết nối đến hệ thống. Vui lòng thử lại.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  const reset = () => {
    setData(null);
    setError('');
    setLoading(false);
  };

  return { data, loading, error, execute, reset };
}
