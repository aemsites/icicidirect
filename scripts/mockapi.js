const marginActions = {
  sell: 'https://secure.icicidirect.com/trading/equity/marginsell',
  buy: 'https://secure.icicidirect.com/trading/equity/marginbuy',
};

const mockPredicationConstant = {
  recoPrice: 'Reco. Price',
  cmp: 'CMP',
  targetPrice: 'Target Price',
  stopLoss: 'Stop Loss',
  profitPotential: 'Profit Potential',
  returns: 'Returns',
  action: 'Action',
  profitExit: 'Call Closed and Book Profit Price:',
  minAmount: 'Min. Amount',
  riskProfile: 'Risk Profile',
  buyingRange: 'Buying Range',

};

const apiEndPoints = {
  trading: '/draft/anagarwa/tradingtips.json',
  investing: '/draft/anagarwa/investingideas.json',
  oneclickportfolio: '/draft/anagarwa/oneclickportfolio.json',
  muhratpicks: '/draft/anagarwa/muhratpicks.json',
  finace: '/draft/shroti/finace.json',
  rapidresult: '/draft/jiang/rapidresult.json',
};

function getHostUrl() {
  let hostUrl = window.location.origin;
  if (!hostUrl || hostUrl === 'null') {
    // eslint-disable-next-line prefer-destructuring
    hostUrl = window.location.ancestorOrigins[0];
  }
  return hostUrl;
}

async function fetchDataFromAPI(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function fetchRecommendations(type) {
  const hostUrl = getHostUrl();
  const apiUrl = `${hostUrl}${apiEndPoints[type]}`;
  const data = await fetchDataFromAPI(apiUrl);
  if (!data) {
    return [];
  }
  // Transform the API response to the desired companies array format
  return data.data.map((company) => ({
    action: company.action,
    name: company.company,
    recoPrice: company.recoPrice,
    cmp: company.cmp,
    targetPrice: company.targetPrice,
    stopLoss: company.stopLoss,
    exit: company.exit,
    reportLink: company.reportLink,
    profitPotential: company.profitPotential,
    returns: company.returns,
    minAmount: company.minAmount,
    riskProfile: company.riskProfile,
    buyingRange: company.buyingRange,
  }));
}

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

async function fetchMarketInsightMockData() {
  try {
    const response = await fetch(`${getHostUrl()}/scripts/mock-market-insight.json`);
    if (!response.ok) { // Check if response is OK (status in the range 200-299)
      throw new Error('Network response was not ok');
    }
    const data = await response.json(); // Parse the JSON from the response
    return data; // Return the data so it can be used by whoever calls this function
  } catch (error) {
    return null; // Return null or appropriate error handling
  }
}

async function callMockBlogAPI() {
  return fetchDataFromAPI(`${getHostUrl()}/scripts/mock-blogdata.json`);
}

async function callAPI(apiName) {
  const endpoint = apiEndPoints[apiName];
  if (!endpoint) {
    return null;
  }
  return fetchDataFromAPI(endpoint);
}
function getMarginActionUrl(actionName) {
  return marginActions[actionName];
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
  fetchRecommendations,
  getMarginActionUrl,
  mockPredicationConstant,
  fetchDynamicStockIndexData,
  callMockBlogAPI,
  callAPI,
  fetchRapidResultMockData,
  fetchMarketInsightMockData,
  getHostUrl,
};
