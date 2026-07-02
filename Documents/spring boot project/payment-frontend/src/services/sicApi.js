import apiClient from '../apiClient';

const getAll = (params = {}) => apiClient.get('/sics', { params });

export const sicService = { getAll };
