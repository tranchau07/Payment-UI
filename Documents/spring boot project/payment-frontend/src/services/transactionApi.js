import apiClient from '../apiClient';
import { downloadBlobResponse } from '../utils/downloadBlob';

const BASE_PATH = '/transactions';

const search = (params = {}) => apiClient.get(BASE_PATH, { params });
const getById = (docId) => apiClient.get(`${BASE_PATH}/${docId}`);
const getPostingLegs = (docId) => apiClient.get(`${BASE_PATH}/${docId}/posting-legs`);
const exportSearch = async (params = {}, format = 'XLSX') => {
  const response = await apiClient.get(`${BASE_PATH}/export`, { params: { ...params, format }, responseType: 'blob' });
  downloadBlobResponse(response, `transaction-search.${String(format).toLowerCase()}`);
};
const exportDetail = async (docId, format = 'PDF') => {
  const response = await apiClient.get(`${BASE_PATH}/${docId}/export`, { params: { format }, responseType: 'blob' });
  downloadBlobResponse(response, `transaction-detail-${docId}.${String(format).toLowerCase()}`);
};
const exportPostingLegs = async (docId, format = 'XLSX') => {
  const response = await apiClient.get(`${BASE_PATH}/${docId}/posting-legs/export`, { params: { format }, responseType: 'blob' });
  downloadBlobResponse(response, `posting-legs-${docId}.${String(format).toLowerCase()}`);
};

export const transactionService = { search, getById, getPostingLegs, exportSearch, exportDetail, exportPostingLegs };
