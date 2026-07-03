import apiClient from '../apiClient';

const BASE_PATH = '/transactions';

const search = (params = {}) => apiClient.get(BASE_PATH, { params });
const getById = (docId) => apiClient.get(`${BASE_PATH}/${docId}`);
const getPostingLegs = (docId) => apiClient.get(`${BASE_PATH}/${docId}/posting-legs`);

export const transactionService = { search, getById, getPostingLegs };
