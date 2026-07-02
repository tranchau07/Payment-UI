import apiClient from '../apiClient';

const BASE_PATH = '/langs';

const getAll = () => apiClient.get(BASE_PATH);

export const langService = {
  getAll
};
