import apiClient from '../apiClient';

const BASE_PATH = '/maritalStatuses';

const getAll = () => apiClient.get(BASE_PATH);

export const maritalStatusService = {
  getAll
};
