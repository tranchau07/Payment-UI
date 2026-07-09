import apiClient from '../apiClient';
import { downloadBlobResponse } from '../utils/downloadBlob';

const BASE_PATH = '/docs';

const getByContractId = (contractId, params) => 
  apiClient.get(`${BASE_PATH}/contract/${contractId}`, { params });

const search = (params) => 
  apiClient.get(BASE_PATH, { params });

const getMetadata = () => apiClient.get(`${BASE_PATH}/metadata`);
const getContractCashFlows = () => apiClient.get(`${BASE_PATH}/contracts/cash-flow`);
const exportContractCashFlows = async (format = 'XLSX') => {
  const response = await apiClient.get(`${BASE_PATH}/contracts/cash-flow/export`, { params: { format }, responseType: 'blob' });
  downloadBlobResponse(response, `contract-cash-flow.${String(format).toLowerCase()}`);
};

export const docService = {
  getByContractId,
  search,
  getMetadata,
  getContractCashFlows,
  exportContractCashFlows
};
