import apiClient from '../apiClient';

const BASE_PATH = '/contracts';

const createWithLiability = (data) => apiClient.post(`${BASE_PATH}/create-with-liability`, data);
const checkLiability = (clientNumber) => apiClient.get(`${BASE_PATH}/liability-by-client/${clientNumber}`);
const createLiability = (data) => apiClient.post(`${BASE_PATH}/create-liability`, data);

export const contractService = {
  createWithLiability,
  checkLiability,
  createLiability,
};
