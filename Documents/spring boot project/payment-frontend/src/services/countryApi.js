import apiClient from '../apiClient';

const BASE_PATH = '/countries';

const getAll = () => apiClient.get(BASE_PATH);
export const countryService = {
  getAll
};
