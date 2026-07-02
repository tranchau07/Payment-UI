import apiClient from '../apiClient';

const BASE_PATH = '/fis';

const getAll = () => apiClient.get(BASE_PATH);

export const fiService = {
  getAll
};
