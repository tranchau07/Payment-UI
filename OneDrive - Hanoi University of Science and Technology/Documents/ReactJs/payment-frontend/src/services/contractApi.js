import apiClient from '../apiClient';

const BASE_PATH = '/contracts';

const createWithLiability = (data) => apiClient.post(`${BASE_PATH}/create-with-liability`, data);

export const contractService = {
  createWithLiability,
};
