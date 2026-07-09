import apiClient from '../apiClient';
import { idempotencyHeaders } from '../utils/idempotency';
import { downloadBlobResponse } from '../utils/downloadBlob';

const BASE_PATH = '/merchants';

const register = (data, idempotencyKey) => apiClient.post(`${BASE_PATH}/register`, data, idempotencyHeaders(idempotencyKey));

const search = (params) => apiClient.get(BASE_PATH, { params });
const exportSearch = async (params = {}, format = 'XLSX') => {
  const response = await apiClient.get(`${BASE_PATH}/export`, { params: { ...params, format }, responseType: 'blob' });
  downloadBlobResponse(response, `merchants.${String(format).toLowerCase()}`);
};

export const merchantService = {
  register,
  search,
  exportSearch
};
