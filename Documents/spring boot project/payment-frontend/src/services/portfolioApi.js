import apiClient from '../apiClient';

export const portfolioService = {
  getContract: (contractId) => apiClient.get(`/portfolio/contracts/${contractId}`),
  getAccount: (accountId) => apiClient.get(`/portfolio/accounts/${accountId}`),
};
