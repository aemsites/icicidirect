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
  loadScript, getMetadata,
} from './aem.js';

import {
  decorateQuickLinks,
  defaultAnalyticsLoadDisabled,
  loadAdobeLaunchAndGTM,
  loadAnalyticsDelayed,
} from './blocks-utils.js';
import { decorateSocialShare } from './social-utils.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

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

function initATJS(path, config) {
  window.targetGlobalSettings = config;
  return new Promise((resolve) => {
    import(path).then(resolve);
  });
}

function onDecoratedElement(fn) {
  // Apply propositions to all already decorated blocks/sections
  if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
    fn();
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.target.tagName === 'BODY'
        || m.target.dataset.sectionStatus === 'loaded'
        || m.target.dataset.blockStatus === 'loaded')) {
      fn();
    }
  });
  // Watch sections and blocks being decorated async
  observer.observe(document.querySelector('main'), {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-block-status', 'data-section-status'],
  });
  // Watch anything else added to the body
  observer.observe(document.querySelector('body'), { childList: true });
}

function toCssSelector(selector) {
  return selector.replace(/(\.\S+)?:eq\((\d+)\)/g, (_, clss, i) => `:nth-child(${Number(i) + 1}${clss ? ` of ${clss})` : ''}`);
}

async function getElementForOffer(offer) {
  const selector = offer.cssSelector || toCssSelector(offer.selector);
  return document.querySelector(selector);
}

async function getElementForOffer(offer) {
  const selector = offer.cssSelector || toCssSelector(offer.selector);
  return document.querySelector(selector);
}

async function getAndApplyOffers() {
  const response = await window.adobe.target.getOffers({ request: { execute: { pageLoad: {} } } });
  const { options = [], metrics = [] } = response.execute.pageLoad;
  onDecoratedElement(() => {
    window.adobe.target.applyOffers({ response });
    // keeping track of offers that were already applied
    options.forEach((o) => o.content = o.content.filter((c) => !getElementForOffer(c)));
    // keeping track of metrics that were already applied
    metrics.map((m, i) => getElementForMetric(m) ? i : -1)
        .filter((i) => i >= 0)
        .reverse()
        .map((i) => metrics.splice(i, 1));
  });
}

let atjsPromise = Promise.resolve();
if (getMetadata('target')) {
  atjsPromise = initATJS('./at.js', {
    clientCode: 'acsultimatesupport',
    serverDomain: 'acsultimatesupport.tt.omtrdc.net',
    imsOrgId: '0B6930256441790E0A495FFE@AdobeOrg',
    bodyHidingEnabled: false,
    cookieDomain: window.location.hostname,
    pageLoadEnabled: false,
    secureOnly: true,
    viewsEnabled: false,
    withWebGLRenderer: false,
  });
  document.addEventListener('at-library-loaded', () => getAndApplyOffers());
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await atjsPromise;
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

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// TODO: Remove once chatbot is compatible with Helix domain
loadScript('/scripts/mockxmlhttprequest.js');
loadPage();

window.validateuserToken = '';

window.validateCaptchaToken = '';
