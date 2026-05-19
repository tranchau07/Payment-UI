import apiClient from '../apiClient';

const BASE_PATH = '/addressTypes';

const getAll = () => apiClient.get(BASE_PATH);

export const addressTypeService = {
  getAll
};

