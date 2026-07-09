import apiClient from '../apiClient';
import { downloadBlobResponse } from '../utils/downloadBlob';

export const portfolioService = {
  getContract: (contractId) => apiClient.get(`/portfolio/contracts/${contractId}`),
  getAccount: (accountId) => apiClient.get(`/portfolio/accounts/${accountId}`),
  exportContract: async (contractId, format = 'PDF') => {
    const response = await apiClient.get(`/portfolio/contracts/${contractId}/export`, { params: { format }, responseType: 'blob' });
    downloadBlobResponse(response, `portfolio-contract-${contractId}.${String(format).toLowerCase()}`);
  },
  exportAccount: async (accountId, format = 'PDF') => {
    const response = await apiClient.get(`/portfolio/accounts/${accountId}/export`, { params: { format }, responseType: 'blob' });
    downloadBlobResponse(response, `portfolio-account-${accountId}.${String(format).toLowerCase()}`);
  },
};
