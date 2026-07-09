import apiClient from '../apiClient';
import { downloadBlobResponse } from '../utils/downloadBlob';

const getContractStatement = (contractId, params) => apiClient.get(`/contracts/${contractId}/statement`, { params });

const exportContractStatement = async (contractId, params = {}, format = 'XLSX') => {
  const response = await apiClient.get(`/contracts/${contractId}/statement/export`, {
    params: { ...params, format },
    responseType: 'blob',
  });
  downloadBlobResponse(response, `contract-statement-${contractId}.${String(format).toLowerCase()}`);
};

export const statementService = { getContractStatement, exportContractStatement };
