import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  loadScript, toClassName, getMetadata, toCamelCase,
} from './aem.js';

import {
  decorateQuickLinks,
  defaultAnalyticsLoadDisabled,
  loadAdobeLaunchAndGTM,
  loadAnalyticsDelayed,
} from './blocks-utils.js';
import { decorateSocialShare } from './social-utils.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

// Add you templates below
// window.hlx.templates.add('/templates/my-template');

// Add you plugins below
// window.hlx.plugins.add('/plugins/my-plugin.js');
const targetPromise = (async () => {
  const targetLocation = getMetadata('experiment-target-location');
  console.log(`Resolving target audience for location: ${targetLocation}`);
  const randomString = Math.random().toString(36).substring(7);
  const resp = await fetch(`https://sitesinternal.tt.omtrdc.net/rest/v1/delivery?client=sitesinternal&sessionId=${randomString}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      context: {
        channel: 'web',
      },
      execute: {
        pageLoad: {},
        mboxes: [
          {
            name: targetLocation,
            index: 0,
          },
        ],
      },
    }),
  });
  const payload = await resp.json();
  console.log(`Received payload: ${JSON.stringify(payload)}`);
  const mbox = payload.execute.mboxes.find((mbox) => mbox.name === targetLocation);
  console.log(`Received target offer: ${mbox?.options[0].content}`);
  const { url } = mbox?.options[0].content ?? { url: null };
  console.log(`Resolved challenger url: ${url}`);

  if (url) {
    // Add the current audience to the page
    const link = document.createElement('meta');
    link.setAttribute('property', 'audience:current');
    link.content = url;
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  return !!url;
})();

const AUDIENCES = {
  // mobile: () => window.innerWidth < 600,
  // desktop: () => window.innerWidth >= 600,
  // delhi: async () => {
  //   try {
  //     const position = await new Promise((resolve, reject) => {
  //       navigator.geolocation.getCurrentPosition(resolve, reject);
  //     });
  //     console.log(position.coords.latitude, position.coords.longitude);
  //     const { latitude, longitude } = position.coords;
  //     return (latitude >= 28.3 && latitude <= 28.9) && (longitude >= 77 && longitude <= 77.4);
  //   } catch (error) {
  //     console.error('Error getting location:', error);
  //     return false; // Return a default value in case of error
  //   }
  // },
  // mumbai: async () => {
  //   try {
  //     const position = await new Promise((resolve, reject) => {
  //       navigator.geolocation.getCurrentPosition(resolve, reject);
  //     });
  //     console.log(position.coords.latitude, position.coords.longitude);
  //     const { latitude, longitude } = position.coords;
  //     return (latitude >= 18.9 && latitude <= 19.3) && (longitude >= 72.75 && longitude <= 72.95);
  //   } catch (error) {
  //     console.error('Error getting location:', error);
  //     return false; // Return a default value in case of error
  //   }
  // },

  // define your custom audiences here as needed
  current: () => targetPromise.then(() => true),
};

/**
 * Gets all the metadata elements that are in the given scope.
 * @param {String} scope The scope/prefix for the metadata
 * @returns an array of HTMLElement nodes that match the given scope
 */
export function getAllMetadata(scope) {
  return [...document.head.querySelectorAll(`meta[property^="${scope}:"],meta[name^="${scope}-"]`)]
    .reduce((res, meta) => {
      const id = toClassName(meta.name
        ? meta.name.substring(scope.length + 1)
        : meta.getAttribute('property').split(':')[1]);
      res[id] = meta.getAttribute('content');
      return res;
    }, {});
}

const pluginContext = {
  getAllMetadata,
  getMetadata,
  loadCSS,
  loadScript,
  sampleRUM,
  toCamelCase,
  toClassName,
};

window.hlx.plugins.add('experimentation', {
  condition: () => getMetadata('experiment')
      || Object.keys(getAllMetadata('campaign')).length
      || Object.keys(getAllMetadata('audience')).length,
  options: { audiences: AUDIENCES },
  url: '/plugins/experimentation/src/index.js',
});

// Define an execution context

/**
 * Set the JSON-LD script in the body
 * @param {*} data To be appended json
 * @param {string} name The data-name of the script tag
 */
export function setJsonLd(data, name) {
  const existingScript = document.body.querySelector(`script[data-name="${name}"]`);
  if (existingScript) return;
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

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    buildHowToSchema();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Adds the 'discover-more' class to the specified anchor elements
 * if their text content contains "Discover More".
 * @param {Array<Element>} anchorElements - The anchor elements to decorate.
 * @returns {void}
 */
function decorateDiscoverMore(anchorElements) {
  anchorElements.forEach((anchor) => {
    anchor.classList.add('discover-more');
  });
}

/**
 * Decorates anchor elements for styling updates via CSS.
 * @param {Element} [element=document] - The element to decorate.
 * @returns {void}
 */
function decorateAnchors(element = document) {
  const anchors = Array.from(element.getElementsByTagName('a'));
  const discoverMoreAnchors = anchors.filter((anchor) => anchor.textContent.includes('DISCOVER MORE') && anchor.childElementCount === 0);

  if (discoverMoreAnchors.length > 0) {
    decorateDiscoverMore(discoverMoreAnchors);
  }

  const socialShareAnchors = anchors.filter((anchor) => {
    const img = anchor.querySelector('img');
    return img && img.src.includes('/icons/gray-share-icon.svg');
  });

  if (socialShareAnchors.length > 0) {
    decorateSocialShare(socialShareAnchors);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateAnchors(document);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateQuickLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  if (getMetadata('experiment')
      || Object.keys(getAllMetadata('campaign')).length
      || Object.keys(getAllMetadata('audience')).length) {
    // eslint-disable-next-line import/no-relative-packages
    const { loadEager: runEager } = await import('../plugins/experimentation/src/index.js');
    await runEager(document, { audiences: AUDIENCES }, pluginContext);
  }

  // await window.hlx.plugins.run('loadEager');
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }

  if (defaultAnalyticsLoadDisabled()) {
    const delayTime = loadAnalyticsDelayed();
    if (delayTime === 0) {
      loadAdobeLaunchAndGTM();
    } else if (delayTime > 0) {
      setTimeout(() => {
        loadAdobeLaunchAndGTM();
      }, delayTime * 1000);
    }
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  window.hlx.plugins.run('loadLazy');

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
  if ((getMetadata('experiment')
      || Object.keys(getAllMetadata('campaign')).length
      || Object.keys(getAllMetadata('audience')).length)) {
    // eslint-disable-next-line import/no-relative-packages
    const { loadLazy: runLazy } = await import('../plugins/experimentation/src/index.js');
    await runLazy(document, { audiences: AUDIENCES }, pluginContext);
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => {
    window.hlx.plugins.load('delayed');
    window.hlx.plugins.run('loadDelayed');
    // eslint-disable-next-line import/no-cycle
    return import('./delayed.js');
  }, 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await window.hlx.plugins.load('eager');
  await loadEager(document);
  await window.hlx.plugins.load('lazy');
  await loadLazy(document);
  loadDelayed();
}

// TODO: Remove once chatbot is compatible with Helix domain
loadScript('/scripts/mockxmlhttprequest.js');
loadPage();

window.validateuserToken = '';

window.validateCaptchaToken = '';
