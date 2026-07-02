import apiClient from '../apiClient';
import { idempotencyHeaders } from '../utils/idempotency';

const BASE_PATH = '/merchants';

const register = (data, idempotencyKey) => apiClient.post(`${BASE_PATH}/register`, data, idempotencyHeaders(idempotencyKey));

const search = (params) => apiClient.get(BASE_PATH, { params });

export const merchantService = {
  register,
  search
};
