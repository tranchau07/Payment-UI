import apiClient from '../apiClient';
import { downloadBlobResponse } from '../utils/downloadBlob';

const BASE_PATH = '/clients';

const register = (data) => apiClient.post(`${BASE_PATH}/register`, data);

const search = (params) => apiClient.get(BASE_PATH, { params });

const getById = (id) => apiClient.get(`${BASE_PATH}/${id}`);

const updateAddress = (id, data) => apiClient.put(`${BASE_PATH}/${id}/address`, data);

const getHierarchy = (id) => apiClient.get(`${BASE_PATH}/${id}/hierarchy`);
const exportHierarchy = async (id, format = 'XLSX') => {
  const response = await apiClient.get(`${BASE_PATH}/${id}/hierarchy/export`, { params: { format }, responseType: 'blob' });
  downloadBlobResponse(response, `client-hierarchy-${id}.${String(format).toLowerCase()}`);
};
const exportSearch = async (params = {}, format = 'XLSX') => {
  const response = await apiClient.get(`${BASE_PATH}/export`, { params: { ...params, format }, responseType: 'blob' });
  downloadBlobResponse(response, `clients.${String(format).toLowerCase()}`);
};

export const clientService = {
  register,
  search,
  getById,
  updateAddress,
  getHierarchy,
  exportHierarchy,
  exportSearch
};

