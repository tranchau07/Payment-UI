import apiClient from '../apiClient';

export const getProductCards = () => {
  return apiClient.get('/appl-products/parent/250314000000000000000660');
};

export const createCard = (cardData) => {
  return apiClient.post('/cards', cardData);
};
