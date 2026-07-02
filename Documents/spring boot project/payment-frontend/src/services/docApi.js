import apiClient from '../apiClient';

const BASE_PATH = '/docs';

const getByContractId = (contractId, params) => 
  apiClient.get(`${BASE_PATH}/contract/${contractId}`, { params });

const search = (params) => 
  apiClient.get(BASE_PATH, { params });

const getMetadata = () => apiClient.get(`${BASE_PATH}/metadata`);
const getContractCashFlows = () => apiClient.get(`${BASE_PATH}/contracts/cash-flow`);

export const docService = {
  getByContractId,
  search,
  getMetadata,
  getContractCashFlows
};
