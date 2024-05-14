import { fetchPlaceholders } from './aem.js';

function getGAToken() {
  return fetchPlaceholders.GA_Token;
}

function fetchRapidResultMockData() {
  return [];
}
export {
  getGAToken,
  fetchRapidResultMockData,
};
