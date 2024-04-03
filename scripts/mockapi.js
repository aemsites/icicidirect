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

async function fetchRecommendations(type) {
  const hostUrl = getHostUrl();
  const apiUrl = `${hostUrl}${apiEndPoints[type]}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Transform the API response to the desired companies array format
    const companies = data.data.map((company) => ({
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
    return companies;
  } catch (error) {
    return [];
  }
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
  try {
    const response = await fetch(`${getHostUrl()}/scripts/mock-blogdata.json`);
    if (!response.ok) { // Check if response is OK (status in the range 200-299)
      throw new Error('Network response was not ok');
    }
    const data = await response.json(); // Parse the JSON from the response
    return data; // Return the data so it can be used by whoever calls this function
  } catch (error) {
    return null; // Return null or appropriate error handling
  }
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

function getTrendingNews() {
  const newsData = [
    {
      imgUrl: 'https://www.icicidirect.com/images/HG Infra-202403190956262997726.png',
      title: 'HG infra. bags four solar projects worth ₹1026 crore',
      link: 'https://www.icicidirect.com/research/equity/trending-news/hg-infra-bags-four-solar-projects-worth-1026-crore',
      date: '19-Mar-2024 09:06',
      source: 'ICICI Securities',
    },
    {
      imgUrl: 'https://www.icicidirect.com/images/Trending_News_261x193-2-202403190926121034455.png',
      title: 'CERC has finalised the tariff regulations for FY24-FY2',
      link: 'https://www.icicidirect.com/research/equity/trending-news/cerc-has-finalised-the-tariff-regulations-for-fy24-fy2',
      date: '19-Mar-2024 09:04',
      source: 'ICICI Securities',
    },
    {
      imgUrl: 'https://www.icicidirect.com/images/Trending_News_261x193-2-202403190926119516615.png',
      title: 'Aditya Birla Capital has approved sale of  stake in Aditya Birla Sun Life AMC',
      link: 'https://www.icicidirect.com/research/equity/trending-news/aditya-birla-capital-has-approved-sale-of-stake-in-aditya-birla-sun-life-amc',
      date: '19-Mar-2024 09:02',
      source: 'ICICI Securities',
    },
    {
      imgUrl: 'https://www.icicidirect.com/images/Trending_News_261x193-2-202403181257495356697.png',
      title: 'Government approves new E-Vehicle policy',
      link: 'https://www.icicidirect.com/research/equity/trending-news/government-approves-new-e-vehicle-policy',
      date: '18-Mar-2024 09:09',
      source: 'ICICI Securities',
    },
  ];
  return newsData;
}

export {
  fetchRecommendations,
  getMarginActionUrl,
  mockPredicationConstant,
  fetchDynamicStockIndexData,
  callMockBlogAPI,
  getTrendingNews,
  fetchRapidResultMockData,
  fetchMarketInsightMockData,
  getHostUrl,
};
