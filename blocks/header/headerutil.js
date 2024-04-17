const ENIITY_TYPE = {
  ALL: 'all',
  EQUITY: '',
  MUTUAL_FUND: 'MF',
  CURRENCY: 'currency',
  COMMODITY: 'commodity',
  KNOWLEDGE_CENTER: 'ilearn',
  IDX: 'IDX',
  DERIVATIVE: 'derivative',
  BONDS: 'bonds',
};

const SITE_ROOT = 'https://www.icicidirect.com';
const EQUITY_BUY_URL = 'https://secure.icicidirect.com/trading/equity/cashbuy';
const EQUITY_SELL_URL = 'https://secure.icicidirect.com/trading/equity/cashsell';
const MF_INVEST_URL = 'https://secure.icicidirect.com/trading/mf/placeorder';

const Console = console || { log: () => {} };

const replaceSpecialChars = (input = '') => {
  let temp = '';
  try {
    temp = input.replace('&', 'and');
    temp = temp.replace('.', '');
    temp = temp.replace(':', '');
    temp = temp.replace('*', '');
    temp = temp.replace(/ /g, '-');
  } catch (e) {
    Console.log(e);
  }
  return temp;
};

const getCompanyUrl = (item, name) => {
  const {
    TYPE: type,
    EXCHANGE: exchange,
    value,
    SYMBOL: symbol,
    EXPDATE: expdate,
    STRIKEPRICE: strikePrice,
    OPTTYPE: optType,
    UrlText: urlText,
    Url: itemUrl,
  } = item;
  let url = name || '';
  switch (type) {
    case ENIITY_TYPE.EQUITY: {
      url = `${SITE_ROOT}/stocks/${url.toLowerCase()}-share-price`;
      break;
    }
    case ENIITY_TYPE.IDX: {
      url = `${SITE_ROOT}/equity/index/${exchange.toLowerCase()}/${name.toLowerCase()}/${Number(value)}`;
      break;
    }
    case ENIITY_TYPE.MUTUAL_FUND: {
      url = `${SITE_ROOT}/mutual-funds/nav-details/${name.toLowerCase()}-${Number(value)}`;
      break;
    }
    case ENIITY_TYPE.CURRENCY: {
      if (value.toLowerCase() === 'optcur') {
        url = `${SITE_ROOT}/currency-forex-trading/pricequote/${value.toLowerCase()}/${symbol.toLowerCase()}/${expdate}/${strikePrice}/${optType}`;
      }
      url = `${SITE_ROOT}/currency-forex-trading/pricequote/${value.toLowerCase()}/${symbol.toLowerCase()}/${expdate}/0/xx`;
      break;
    }
    case ENIITY_TYPE.COMMODITY: {
      url = `${SITE_ROOT}/commodities-market/pricequote/${exchange.toLowerCase()}/${value.toLowerCase()}/${symbol.toLowerCase()}/${expdate}`;
      break;
    }
    case ENIITY_TYPE.DERIVATIVE: {
      url = `${SITE_ROOT}/derivatives-market/get-quote/${value.toLowerCase()}/${symbol.toLowerCase()}/${expdate}/0/xx`;
      break;
    }
    case ENIITY_TYPE.KNOWLEDGE_CENTER: {
      url = `${SITE_ROOT}/${urlText}`;
      break;
    }
    case ENIITY_TYPE.BONDS: {
      url = `${SITE_ROOT}/${itemUrl}`;
      break;
    }
    default: {
      url = SITE_ROOT;
    }
  }
  return url;
};

const getBuySellInvestUrl = (item) => {
  const {
    TYPE: type,
    ICICICODE: iciciCode,
    CODE: code,
  } = item;

  const obj = {
    buyLink: '',
    sellLink: '',
    investLink: '',
  };
  switch (type) {
    case ENIITY_TYPE.EQUITY: {
      obj.buyLink = `${EQUITY_BUY_URL}/${code}`;
      obj.sellLink = `${EQUITY_SELL_URL}/${code}`;
      break;
    }
    case ENIITY_TYPE.MUTUAL_FUND: {
      obj.investLink = MF_INVEST_URL;
      break;
    }
    case ENIITY_TYPE.BONDS: {
      if (iciciCode) {
        obj.buyLink = `https://secure.icicidirect.com/trading/equity/cashbuy/${iciciCode}`;
        obj.sellLink = `https://secure.icicidirect.com/trading/equity/cashsell/${iciciCode}`;
      } else {
        obj.buyLink = 'https://secure.icicidirect.com/trading/equity/stockmflist/NCDList';
        obj.sellLink = obj.buyLink;
      }
      break;
    }
    default:
  }
  return obj;
};

/**
 * Process Type = '' | IDX
 */
const processEquityType = (items) => {
  const processedData = [];
  items.forEach((item) => {
    const eq = {
      title: item.LONG_NAME || '',
      name: '',
      lastTradingPrice: '',
      url: '',
      buyLink: '',
      sellLink: '',
      change: '',
      changePercentage: '',
      exchange: '',
    };
    eq.name = replaceSpecialChars(item.LONG_NAME);
    eq.name = eq.name.split(' ').join('');
    eq.url = getCompanyUrl(item, eq.name);
    eq.exchange = item.EXCHANGE;
    eq.lastTradingPrice = item.LTP;
    eq.change = item.CHANGE;
    eq.changePercentage = item.CHANGEPER;
    const { buyLink, sellLink } = getBuySellInvestUrl(item);
    eq.buyLink = buyLink;
    eq.sellLink = sellLink;
    processedData.push(eq);
  });
  return processedData;
};

/**
 * Process Type = MF
 */
const processMutualFundsType = (items) => {
  const processedData = [];
  items.forEach((item) => {
    const mf = {
      title: item.LONG_NAME || '',
      name: '',
      lastTradingPrice: '',
      url: '',
      investLink: '',
      change: '',
      changePercentage: '',
    };
    mf.name = replaceSpecialChars(item.LONG_NAME);
    mf.name = mf.name.split(' ').join('-');
    mf.url = getCompanyUrl(item, mf.name);
    const { investLink } = getBuySellInvestUrl(item);
    mf.investLink = investLink;
    mf.lastTradingPrice = item.LTP;
    mf.change = item.CHANGE;
    mf.changePercentage = item.CHANGEPER;
    processedData.push(mf);
  });
  return processedData;
};

/**
 * Process Type = currency
 */
const processCurrencyType = (items) => {
  const processedData = [];
  items.forEach((item) => {
    const curr = {
      title: item.LONG_NAME || '',
      name: '',
      lastTradingPrice: '',
      url: '',
      change: '',
      changePercentage: '',
    };
    curr.name = replaceSpecialChars(item.LONG_NAME);
    curr.name = curr.name.split(' ').join('-');
    curr.url = getCompanyUrl(item, curr.name);
    curr.lastTradingPrice = item.LTP;
    curr.change = item.CHANGE;
    curr.changePercentage = item.CHANGEPER;
    processedData.push(curr);
  });
  return processedData;
};

/**
 * Process Type = commodity
 */
const processCommodityType = (items) => {
  const processedData = [];
  items.forEach((item) => {
    const comm = {
      title: item.LONG_NAME || '',
      name: '',
      lastTradingPrice: '',
      url: '',
      change: '',
      changePercentage: '',
    };
    comm.name = replaceSpecialChars(item.LONG_NAME);
    comm.name = comm.name.split(' ').join('-');
    comm.url = getCompanyUrl(item, comm.name);
    comm.lastTradingPrice = item.LTP;
    comm.change = item.CHANGE;
    comm.changePercentage = item.CHANGEPER;
    processedData.push(comm);
  });
  return processedData;
};

/**
 * Process Type = derivative
 */
const processDerivativeType = (items) => {
  const processedData = [];
  items.forEach((item) => {
    const deri = {
      title: item.LONG_NAME || '',
      name: '',
      url: '',
    };
    deri.name = replaceSpecialChars(item.LONG_NAME);
    deri.name = deri.name.split(' ').join('-');
    deri.url = getCompanyUrl(item, deri.name);
    processedData.push(deri);
  });
  return processedData;
};

/**
 * Process Type = knowledge_center
 */
const processKnowledgeCenterType = (items) => {
  const processedData = [];
  items.forEach((item) => {
    const know = {
      title: item.Title || '',
      name: '',
      url: '',
    };
    know.name = item.Title;
    know.url = getCompanyUrl(item, know.name);
    processedData.push(know);
  });
  return processedData;
};

/**
 * Process Type = bonds
 */
const processBondsType = (items) => {
  const processedData = [];
  items.forEach((item) => {
    const bond = {
      title: item.label || '',
      name: '',
      url: '',
      buyLink: '',
      sellLink: '',
      listingFlag: item.LISTING_FLAG,
      isin: item.ISIN,
      maturityDate: item.MATURITY_DATE,
    };
    bond.name = item.label;
    bond.url = getCompanyUrl(item, bond.name);
    const { buyLink, sellLink } = getBuySellInvestUrl(item);
    bond.buyLink = buyLink;
    bond.sellLink = sellLink;
    processedData.push(bond);
  });
  return processedData;
};

export {
  processEquityType,
  processMutualFundsType,
  processCurrencyType,
  processCommodityType,
  processDerivativeType,
  processKnowledgeCenterType,
  processBondsType,
  ENIITY_TYPE,
};
