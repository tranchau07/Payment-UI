import apiClient from '../apiClient';
import { idempotencyHeaders } from '../utils/idempotency';

const BASE_PATH = '/contracts';

const createWithLiability = (data) => apiClient.post(`${BASE_PATH}/create-with-liability`, data);
const checkLiability = (clientNumber) => apiClient.get(`${BASE_PATH}/liability-by-client/${clientNumber}`);
const createLiability = (data) => apiClient.post(`${BASE_PATH}/create-liability`, data);
const createAcquiring = (data, idempotencyKey) => apiClient.post(`${BASE_PATH}/acquiring`, data, idempotencyHeaders(idempotencyKey));
const createAcquiringAddress = (contractNumber, data, idempotencyKey) =>
  apiClient.post(`${BASE_PATH}/acquiring/${encodeURIComponent(contractNumber)}/addresses`, data, idempotencyHeaders(idempotencyKey));
const createDevice = (contractNumber, data, idempotencyKey) =>
  apiClient.post(`${BASE_PATH}/acquiring/${encodeURIComponent(contractNumber)}/devices`, data, idempotencyHeaders(idempotencyKey));

export const contractService = {
  createWithLiability,
  checkLiability,
  createLiability,
  createAcquiring,
  createAcquiringAddress,
  createDevice,
};
