import {
  createOptimizedPicture, loadScript, readBlockConfig, toCamelCase, toClassName,
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

async function loadGTM() {
  setTimeout(() => {
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
  }, 1000);
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

function defaultAnalyticsLoadDisabled() {
  const delayParam = getQueryParam(DELAY_MARTECH_PARAMS);
  const result = delayParam !== null && !Number.isNaN(delayParam);
  // eslint-disable-next-line no-console
  console.log('defaultAnalyticsLoadDisabled', result);
  return result;
}

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
  const reportLink = `https://${ICICI_FINOUX_HOST}/research/equity/`
    + `${formattedCompanyName}/${trimmedReportId}`;

  return reportLink;
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
  loadAnalyticsDelayed,
  loadAdobeLaunchAndGTM,
  defaultAnalyticsLoadDisabled,
  generateReportLink,
  sanitizeCompanyName,
  CONTENT_FEED_URL,
  SOCKET_IO_SCRIPT,
};
