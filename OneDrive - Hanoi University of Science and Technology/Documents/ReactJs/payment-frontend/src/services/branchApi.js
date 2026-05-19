import apiClient from '../apiClient';

const BASE_PATH = '/branches';

const getAll = () => apiClient.get(BASE_PATH);

const getByCode = (code) => apiClient.get(`${BASE_PATH}/${encodeURIComponent(code)}`);

export const branchService = {
  getAll,
  getByCode,
};
