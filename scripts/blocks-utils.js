import {
  createOptimizedPicture, loadScript, readBlockConfig, toCamelCase, toClassName, fetchPlaceholders,
} from './aem.js';

const WORKER_ORIGIN_URL = 'https://icicidirect-secure-worker.franklin-prod.workers.dev';
const RESEARCH_API_URL = `${WORKER_ORIGIN_URL}/CDNResearchAPI/CallResearchAPI`;
const MARKETING_API_URL = `${WORKER_ORIGIN_URL}/CDNMarketAPI/CallMarketAPI`;
const ICICI_FINOUX_HOST = 'http://icicidirect.finoux.com';
const SITE_ROOT = 'https://www.icicidirect.com';
const CONTENT_FEED_URL = 'https://contentfeeds.icicidirect.com/';
const SOCKET_IO_SCRIPT = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.0/socket.io.min.js';

const DELAY_MARTECH_PARAMS = 'delayMartech';
const LOAD_MARTECH_PARAM = 'loadMartech';

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

const Viewport = (function initializeViewport() {
  let deviceType;

  const breakpoints = {
    mobile: window.matchMedia('(max-width: 47.99rem)'),
    tablet: window.matchMedia('(min-width: 48rem) and (max-width: 63.99rem)'),
    desktop: window.matchMedia('(min-width: 64rem)'),
  };

  function getDeviceType() {
    if (breakpoints.mobile.matches) {
      deviceType = 'Mobile';
    } else if (breakpoints.tablet.matches) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Desktop';
    }
    return deviceType;
  }
  getDeviceType();

  getDeviceType();

  function isDesktop() {
    return deviceType === 'Desktop';
  }

  function isMobile() {
    return deviceType === 'Mobile';
  }
  function isTablet() {
    return deviceType === 'Tablet';
  }
  return {
    getDeviceType,
    isDesktop,
    isMobile,
    isTablet,
  };
}());

function createElement(tagname, className) {
  const element = document.createElement(tagname);
  if (className) {
    element.classList.add(className);
  }
  return element;
}

/**
 * Formats the date time in the format 'Mar 15, 2024 03:09 PM'
 * @param {*} date input date to be formatted
 * @returns formatted date and time
 */
const formatDateTime = (date) => date && date.toLocaleString('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

function createPictureElement(
  src,
  alt = '',
  eager = false,
  breakpoints = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }],
) {
  if (src.indexOf('http://') === -1 && src.indexOf('https://') === -1) {
    return createOptimizedPicture(src, alt, eager, breakpoints);
  }
  const picture = document.createElement('picture');
  const image = document.createElement('img');
  image.setAttribute('src', src);
  image.setAttribute('alt', alt);
  image.setAttribute('loading', eager ? 'eager' : 'lazy');
  picture.appendChild(image);
  return picture;
}

function observe(elementToObserve, callback, ...args) {
  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(elementToObserve, ...args);
        observerInstance.disconnect();
      }
    });
  }, {
    root: null,
    threshold: 0.1,
  });

  observer.observe(elementToObserve);
}

function getOriginUrl() {
  return WORKER_ORIGIN_URL;
}

function getResearchAPIUrl() {
  return RESEARCH_API_URL;
}

function getMarketingAPIUrl() {
  return MARKETING_API_URL;
}
/**
 * Fetches data from the given URL and calls the callback function with the response.
 * @param {string} url The URL to fetch data from.
 * @param {Function} callback The callback function to call with the response.
 * @param {string} apiName The name of the API to be called.
 * returns {void}
 * @example
 * fetchData('https://jsonplaceholder.typicode.com/todos/1', (error, data) => {
 *  if (error) {
 *   console.error(error);
 * } else {
 *  console.log(data);
 * }
 * }); // GET request
 */
function fetchData(url, callback) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      callback(null, data);
    })
    .catch((error) => {
      callback(error, null);
    });
}

function formDataToJSON(formData) {
  const jsonObject = {};
  formData.forEach((value, key) => {
    // eslint-disable-next-line no-prototype-builtins
    if (!jsonObject.hasOwnProperty(key)) {
      jsonObject[key] = value;
    } else {
      if (!Array.isArray(jsonObject[key])) {
        jsonObject[key] = [jsonObject[key]];
      }
      jsonObject[key].push(value);
    }
  });
  return JSON.stringify(jsonObject);
}

/**
 * Posts form data to the given URL and calls the callback function with the response.
 * @param url
 * @param formData
 * @param callback
 * @param options
 * @example
 * const formData = new FormData();
 * formData.append('apiName', 'getdata');
 * postFormData('https://example.com/data', formData, (error, data) => {
 *  if (error) {
 *  console.error('Error fetching data:', error);
 *  }
 *  else {
 *  console.log('Data fetched successfully:', data);
 *  }
 *
 */
function postFormData(url, formData, callback, options = {}) {
  let formDataString;
  if (formData instanceof FormData) {
    formDataString = formDataToJSON(formData);
  } else {
    // assuming formData is already a JSON object
    formDataString = JSON.stringify(formData);
  }

  const requestOptions = {
    method: 'POST',
    headers: options.headers || {},
    body: formDataString,
    ...options, // Override any additional options provided
  };

  fetch(url, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      callback(null, data);
    })
    .catch((error) => {
      callback(error, null);
    });
}

/**
 * Fetches data from the given API URL and calls the callback function with the response.
 * @param url
 * @param apiName
 * @param callback
 * @example
 * getDataFromAPI('https://example.com/data', 'getdata', (error, data) => {
 * if (error) {
 * console.error('Error fetching data:', error);
 * }
 * else {
 * console.log('Data fetched successfully:', data);
 * }
 * });
 *
 */
function getDataFromAPI(url, apiName, callback) {
  const formData = new FormData();
  formData.append('apiName', apiName);
  postFormData(url, formData, callback);
}

/*
  * Returns the environment type based on the hostname.
*/
function getEnvType(hostname = window.location.hostname) {
  const fqdnToEnvType = {
    'www.icicidirect.com': 'prod',
    'icicidirect.com': 'prod',
    'main--icicidirect--aemsites.hlx.page': 'preview',
    'main--icicidirect--aemsites.hlx.live': 'live',
  };
  return fqdnToEnvType[hostname] || 'dev';
}

/**
 * Decorates all blocks in a container element to enable quicklinks metadata.
 * @param {Element} main The container element under which quicklinks has to be enabled.
 */
function decorateQuickLinks(main) {
  const handQuickLinksMetadataForTabs = (section) => {
    const quickLinkTitles = section.getAttribute('data-quicklinks-title').split(',');
    const nestedTabs = section.querySelectorAll('.block.tabs > div > div:first-child');
    const nestedTabsIndexed = Array.from(nestedTabs);
    // assign the ids as per the order of tabs
    quickLinkTitles.forEach((singleTitle, index) => {
      nestedTabsIndexed[index].id = toCamelCase(singleTitle.trim());
      nestedTabsIndexed[index].setAttribute('data-quicklinks-title', singleTitle.trim());
    });
    section.removeAttribute('data-quicklinks-title');
  };
  const addQuickLinksMetadataForBlocks = (block) => {
    // extract the quicklinks details if present
    const blockConfig = readBlockConfig(block);
    const quickLinkTitle = blockConfig['quicklinks-title'];
    if (quickLinkTitle) {
      block.dataset.quicklinksTitle = quickLinkTitle;
      block.id = toCamelCase(quickLinkTitle);
    }
  };
  main.querySelectorAll('div.tabs-container[data-quicklinks-title]').forEach(handQuickLinksMetadataForTabs);
  main.querySelectorAll('div.section-container > div > div').forEach(addQuickLinksMetadataForBlocks);
}

/**
 * Reads the block markup and returns the configuration object.
 * This function returns the second column of each row as the value for the first column.
 * If there are more than two columns in a row, the function ignores the rest of the columns.
 * but those can be retrived by nextSibling property of the value column.
 * @param block - The block element.
 * @returns {{}} - The configuration object.
 */
function readBlockMarkup(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        config[name] = col;
      }
    }
  });
  return config;
}

/**
 * Parses the response from the Secure Worker API.
 * @param {Object} apiResponse - Response from the Secure Worker API.
 * @returns {Object} - Parsed JSON object.
 */
function parseResponse(apiResponse) {
  const result = [];
  apiResponse.Data.forEach((item) => {
    const jsonObject = {};
    let excludeItem = false;
    item.forEach((data) => {
      if (data.Key === 'TOTAL_COUNT') {
        excludeItem = true;
        return;
      }
      jsonObject[data.Key] = data.Value;
    });
    if (!excludeItem) {
      result.push(jsonObject);
    }
  });
  return result;
}

/* Helper for delaying something like
takes function as argument, default timout = 200
*/
function debounce(func, timeout = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function loadGTM() {
  const scriptTag = document.createElement('script');
  scriptTag.innerHTML = `
          (function (w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({
              'gtm.start':
                  new Date().getTime(), event: 'gtm.js'
          });
          var f = d.getElementsByTagName(s)[0],
              j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
          j.async = true;
          j.src =
              'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
          f.parentNode.insertBefore(j, f);
          }(window, document, 'script', 'dataLayer', 'GTM-WF9LTLZ'));
      `;
  document.head.prepend(scriptTag);
}

function loadAdobeLaunch() {
  const adobeLaunchSrc = {
    dev: 'https://assets.adobedtm.com/64c36731dbac/390f7bab5b74/launch-285ee83071cc-development.min.js',
    preview: 'https://assets.adobedtm.com/64c36731dbac/390f7bab5b74/launch-285ee83071cc-development.min.js',
    live: 'https://assets.adobedtm.com/64c36731dbac/390f7bab5b74/launch-285ee83071cc-development.min.js',
    prod: 'https://assets.adobedtm.com/64c36731dbac/390f7bab5b74/launch-285ee83071cc-development.min.js',
  };
  loadScript(adobeLaunchSrc[getEnvType()], { async: true });
}

/**
 * Get query param from URL
 * @param param {string} The query param to get
 * @returns {string} The value of the query param
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function loadAdobeLaunchAndGTM() {
  const loadMartech = getQueryParam(LOAD_MARTECH_PARAM) ?? 'all';
  if (loadMartech === 'adobe') {
    loadAdobeLaunch();
  } else if (loadMartech === 'gtm') {
    loadGTM();
  } else if (loadMartech === 'all') {
    loadAdobeLaunch();
    loadGTM();
  }
}

/**
 * Tells if the delay is overridden through query param
 * @returns {boolean} True if the delay is overridden through query param else false
 */
function isCustomAnalyticsLoadDelay() {
  const delayParam = getQueryParam(DELAY_MARTECH_PARAMS);
  const result = delayParam !== null && !Number.isNaN(delayParam) && delayParam >= 0;
  // eslint-disable-next-line no-console
  console.log('isCustomAnalyticsLoadDelay', result);
  return result;
}

/**
 * Extracts the delay time from the query param
 * If the delay time is not present or invalid, returns -1
 * @returns {number} The delay time in seconds
 */
function loadAnalyticsDelayed() {
  let delayTime = -1;
  const delayMartech = getQueryParam(DELAY_MARTECH_PARAMS);
  if (delayMartech && !Number.isNaN(parseInt(delayMartech, 10))) {
    delayTime = parseInt(delayMartech, 10);
  }
  return delayTime;
}

function sanitizeCompanyName(companyName) {
  const formattedCompanyName = companyName.replace(/[^a-zA-Z0-9 ]/g, '')
    .trim().replace(/\s+/g, '-').toLowerCase();
  return formattedCompanyName;
}

function generateReportLink(companyName, reportId) {
  const formattedCompanyName = sanitizeCompanyName(companyName);
  // Trim trailing .0 from RES_REPORT_ID
  const trimmedReportId = reportId.toString().replace(/\.0$/, '');

  // Generate report link
  const reportLink = `${ICICI_FINOUX_HOST}/research/equity/`
    + `${formattedCompanyName}/${trimmedReportId}`;

  return reportLink;
}

function getHostUrl() {
  let hostUrl = window.location.origin;
  if (!hostUrl || hostUrl === 'null') {
    // eslint-disable-next-line prefer-destructuring
    hostUrl = window.location.ancestorOrigins[0];
  }
  return hostUrl;
}

/**
 * Util function to append no results message in the block with no data to display
 * @param {*} element - The element to append the no results message
 */
const handleNoResults = (element) => {
  if (element) {
    element.innerHTML = '';
    element.classList.add('no-results');
    const noResultsDiv = document.createElement('div');
    noResultsDiv.className = 'no-results';
    fetchPlaceholders().then((placeholders) => {
      noResultsDiv.textContent = placeholders.norecordsfound;
      element.appendChild(noResultsDiv);
    });
  }
};

/**
 * Returns the true of the current page in the browser.
 * If the page is running in a iframe with srcdoc,
 * the ancestor origin + the path query param is returned.
 * @returns {String} The href of the current page or the href of the block running in the library
 */
function getHref() {
  if (window.location.href !== 'about:srcdoc') return window.location.href;

  const urlParams = new URLSearchParams(window.parent.location.search);
  return `${window.parent.location.origin}${urlParams.get('path')}`;
}

function isInternalPage() {
  return getHref().indexOf('/sidekick/blocks/') > 0 || getHref().indexOf('/_tools/') > 0;
}

/**
 * Add prefetch link to the head
 * @param {*} kind - The kind of prefetch link
 * @param {*} url - The URL to prefetch
 * @param {*} as - The as attribute for the prefetch link
 */
function addPrefetch(kind, url, as) {
  const linkEl = document.createElement('link');
  linkEl.rel = kind;
  linkEl.href = url;
  if (as) {
    linkEl.as = as;
  }
  document.head.append(linkEl);
}

async function loadStockFeed(gaTokenId) {
  if (!gaTokenId) {
    const placeholders = await fetchPlaceholders();
    // eslint-disable-next-line no-param-reassign
    gaTokenId = placeholders.gaToken;
  }
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
    const change = stockData[2] - stockData[20];
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
/**
 * Set the JSON-LD script in the body
 * @param {*} data To be appended json
 * @param {string} name The data-name of the script tag
 */
function setJsonLd(data, name) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  script.dataset.name = name;
  document.body.appendChild(script);
}

/**
 * Builds HowTo schema and append it to body.
 */
async function buildHowToSchema() {
  const existingScript = document.body.querySelector('script[data-name="howto"]');
  if (existingScript) return;
  // Get Howto schema from schema excel
  const response = await fetch('/howto-schema.json?sheet=data&sheet=step');
  const json = await response.json();
  const jsonLD = {};
  if (json) {
    if (json.data.data) {
      Object.assign(jsonLD, json.data.data[0]);
    }
    if (json.step.data) {
      jsonLD.step = json.step.data;
    }
  }
  setJsonLd(jsonLD, 'howto');
}

export {
  isInViewport,
  Viewport,
  createElement,
  formatDateTime,
  createPictureElement,
  observe,
  getEnvType,
  decorateQuickLinks,
  fetchData,
  getOriginUrl,
  getResearchAPIUrl,
  getMarketingAPIUrl,
  getDataFromAPI,
  postFormData,
  readBlockMarkup,
  parseResponse,
  debounce,
  ICICI_FINOUX_HOST,
  SITE_ROOT,
  loadAdobeLaunch,
  loadGTM,
  getQueryParam,
  getHostUrl,
  loadAnalyticsDelayed,
  loadAdobeLaunchAndGTM,
  isCustomAnalyticsLoadDelay,
  generateReportLink,
  sanitizeCompanyName,
  CONTENT_FEED_URL,
  SOCKET_IO_SCRIPT,
  handleNoResults,
  getHref,
  isInternalPage,
  addPrefetch,
  loadStockFeed,
  buildHowToSchema,
};
