import { getHostUrl } from './blocks-utils.js';

async function fetchRapidResultMockData() {
  try {
    const response = await fetch(`${getHostUrl()}/scripts/mock-rapid-result.json`);
    if (!response.ok) { // Check if response is OK (status in the range 200-299)
      throw new Error('Network response was not ok');
    }
    const data = await response.json(); // Parse the JSON from the response
    return data; // Return the data so it can be used by whoever calls this function
  } catch (error) {
    return null; // Return null or appropriate error handling
  }
}

const fetchDynamicStockIndexData = () => [
  {
    id: 'spnNifty_n',
    indexName: 'NIFTY',
    stockValue: 22415.15,
    change: 104.13,
    changePercentage: 0.35,
  },
  {
    id: 'spnSensex_s',
    indexName: 'SENSEX',
    stockValue: 73038.14,
    change: -145.78,
    changePercentage: -0.45,
  },
];

export {
  fetchDynamicStockIndexData,
  fetchRapidResultMockData,
};
