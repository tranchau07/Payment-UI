import apiClient from '../apiClient';

const BASE_PATH = '/clients';

const register = (data) => apiClient.post(`${BASE_PATH}/register`, data);

const search = (params) => apiClient.get(BASE_PATH, { params });

const getById = (id) => apiClient.get(`${BASE_PATH}/${id}`);

const updateAddress = (id, data) => apiClient.put(`${BASE_PATH}/${id}/address`, data);

export const clientService = {
  register,
  search,
  getById,
  updateAddress
};
