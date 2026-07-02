import apiClient from '../apiClient';

const getAll = () => apiClient.get('/appl-products');
const getTree = () => apiClient.get('/products/tree');
const getIssuingConfigurations = (includeNotReady = false) =>
  apiClient.get('/product-configurations/issuing', { params: { includeNotReady } });
const getAcquiringConfigurations = (includeNotReady = false) =>
  apiClient.get('/product-configurations/acquiring', { params: { includeNotReady } });
const getConfigurationByCode = (code) =>
  apiClient.get(`/product-configurations/${encodeURIComponent(code)}`);

export const applProductService = {
  getAll,
  getTree,
  getIssuingConfigurations,
  getAcquiringConfigurations,
  getConfigurationByCode,
};
