import { createOptimizedPicture, readBlockConfig, toCamelCase } from './aem.js';

const WORKER_ORIGIN_URL = 'https://icicidirect-secure-worker.franklin-prod.workers.dev';

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
  return `${getOriginUrl()}/CDNResearchAPI/CallResearchAPI`;
}

function getMarketingAPIUrl() {
  return `${getOriginUrl()}/CDNMarketAPI/CallMarketAPI`;
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
 *
 * fetchData('https://example.com/data', (error, data) => {
 *   if (error) {
 *     console.error('Error fetching data:', error);
 *   } else {
 *     console.log('Data fetched successfully:', data);
 *   }
 * }, 'getdata'); // POST request with API name
 */
function fetchData(url, callback, apiName = null) {
  const options = {
    method: 'GET', // Default method is GET
  };

  if (apiName) {
    options.method = 'POST';
    options.headers = {
      'Content-Type': 'application/json',
    };
    options.body = JSON.stringify({ apiName });
  }

  fetch(url, options)
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
  const addQuickLinksMetadata = (block) => {
    // extract the quicklinks details if present
    const blockConfig = readBlockConfig(block);
    const quickLinkTitle = blockConfig['quicklinks-title'];
    if (quickLinkTitle) {
      block.dataset.quicklinksTitle = quickLinkTitle;
      block.id = toCamelCase(quickLinkTitle);
    }
  };
  main.querySelectorAll('div.section-container > div > div').forEach(addQuickLinksMetadata);
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
};
