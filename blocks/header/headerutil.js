import { SITE_ROOT, CONTENT_FEED_URL, SOCKET_IO_SCRIPT } from '../../scripts/blocks-utils.js';

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

function loadStockFeed(gaTokenId) {
  let socket = null;
  const nifty50 = '4.1!NIFTY 50';
  const sensex = '1.1!SENSEX';

  // Get current date in IST timezone
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', weekday: 'long', hour12: false,
  };
  const formatter = new Intl.DateTimeFormat([], options);
  const ISTTime = formatter.format(now);

  // Extract day, time from ISTTime
  const [day, ...timeParts] = ISTTime.split(' ');
  const time = timeParts.join(' ');

  // Extract hour, minute, and period from time
  const [hourMinute] = time.split(' ');
  const [hour, minute] = hourMinute.split(':').map(Number);

  // Set feedFlag based on the time and day
  const feedFlag = day !== 'Saturday' && day !== 'Sunday' && ((hour > 9 || (hour === 9 && minute >= 15)) && (hour < 15 || (hour === 15 && minute <= 30)));

  const connect = (hostname, token) => {
    // eslint-disable-next-line no-undef
    socket = io.connect(hostname, {
      auth: { token },
      transports: ['websocket'],
    });
  };

  const watch = (symbols) => {
    socket.emit('join', symbols);
  };

  const onChange = (callback) => {
    socket.on('stock', callback);
  };

  const getScript = (source, callback) => {
    const script = document.createElement('script');
    const prior = document.getElementsByTagName('script')[0];
    script.async = 1;
    script.src = source;
    script.onload = callback;
    prior.parentNode.insertBefore(script, prior);
  };

  function updateStockInfo(stockName, stockData) {
    const previousStockValueString = document.querySelector(`.stock-item.${stockName} .share-value`).textContent;
    const previousStockValue = parseFloat(previousStockValueString.replace(/,/g, ''));
    const stockValueElement = document.querySelector(`.stock-item.${stockName} .share-value`);
    const shareChangeSpan = document.querySelector(`.stock-item.${stockName} .share-change`);

    if (stockData[5] > 0) {
      stockValueElement.classList.remove('negative');
      stockValueElement.classList.add('positive');
      shareChangeSpan.classList.remove('share-down');
      shareChangeSpan.classList.add('share-up');
    } else if (stockData[5] < 0) {
      stockValueElement.classList.remove('positive');
      stockValueElement.classList.add('negative');
      shareChangeSpan.classList.remove('share-up');
      shareChangeSpan.classList.add('share-down');
    }

    if (stockData[2] > previousStockValue) {
      stockValueElement.classList.remove('negative');
      stockValueElement.classList.add('positive');
    } else if (stockData[2] < previousStockValue) {
      stockValueElement.classList.remove('positive');
      stockValueElement.classList.add('negative');
    }
    // eslint-disable-next-line prefer-destructuring
    stockValueElement.textContent = stockData[2].toLocaleString();
    const change = stockData[20] - stockData[2];
    shareChangeSpan.textContent = `${change.toFixed(2)}(${stockData[5].toFixed(2)}%)`;
  }

  if (feedFlag) {
    getScript(SOCKET_IO_SCRIPT, () => {
      connect(CONTENT_FEED_URL, gaTokenId);
      watch([nifty50, sensex]);
      onChange(async (stockData) => {
        if (stockData[0].includes(nifty50)) {
          updateStockInfo('nifty', stockData);
        } else if (stockData[0].includes(sensex)) {
          updateStockInfo('sensex', stockData);
        }
      });
    });
    document.querySelector('.stock-item .spn-date-time').classList.add('market-open');
  } else {
    const niftyValue = document.querySelector('.stock-item.nifty .share-value');
    niftyValue.classList.remove('negative', 'positive');
    niftyValue.classList.add('market-closed');
    const sensexValue = document.querySelector('.stock-item.sensex .share-value');
    sensexValue.classList.remove('negative', 'positive');
    sensexValue.classList.add('market-closed');
  }
}
export {
  processEquityType,
  processMutualFundsType,
  processCurrencyType,
  processCommodityType,
  processDerivativeType,
  processKnowledgeCenterType,
  processBondsType,
  ENIITY_TYPE,
  loadStockFeed,
};
