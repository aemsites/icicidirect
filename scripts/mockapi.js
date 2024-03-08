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
};

async function fetchRecommendations(type) {
  const apiUrl = `${window.location.origin}${apiEndPoints[type]}`;
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

function getMarginActionUrl(actionName) {
  return marginActions[actionName];
}

export {
  fetchRecommendations,
  getMarginActionUrl,
  mockPredicationConstant,
};
