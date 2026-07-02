import apiClient from '../apiClient';

const getAll = () => apiClient.get('/currencies');

export const currencyService = { getAll };
