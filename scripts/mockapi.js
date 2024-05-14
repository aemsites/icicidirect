import { fetchPlaceholders } from './aem.js';

function getGAToken() {
  return fetchPlaceholders.GA_Token;
}

export default getGAToken;
