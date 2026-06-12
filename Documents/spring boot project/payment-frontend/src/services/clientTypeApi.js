import apiClient from '../apiClient';

const BASE_PATH = '/clientTypes';

const getAll = () => apiClient.get(BASE_PATH);
export const clientTypeService = {
  getAll
};
