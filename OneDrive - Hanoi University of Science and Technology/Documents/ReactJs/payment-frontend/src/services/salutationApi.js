import apiClient from '../apiClient';

const BASE_PATH = '/salutations';

const getAll = () => apiClient.get(BASE_PATH);

const getByCode = (code) => apiClient.get(`${BASE_PATH}/${encodeURIComponent(code)}`);

export const salutationService = {
  getAll,
  getByCode,
};
