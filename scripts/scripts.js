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
  getMetadata,
} from './aem.js';

import {
  decorateQuickLinks,
  defaultAnalyticsLoadDisabled, getHostUrl,
  loadAdobeLaunchAndGTM,
  loadAnalyticsDelayed,
  isInternalPage,
  addPrefetch,
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

async function initWebSDK(path) {
  return import(path);
}

function onDecoratedElement(fn) {
  // Apply propositions to all already decorated blocks/sections
  const elements = document.querySelectorAll('[data-block-status="loaded"],[data-section-status="loaded"]');
  if (elements.length > 0) {
    fn();
    elements.forEach((element) => {
      if (element.classList.contains('visibility-hidden')) {
        element.classList.remove('visibility-hidden');
      }
    });
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.target.tagName === 'BODY'
        || m.target.dataset.sectionStatus === 'loaded'
        || m.target.dataset.blockStatus === 'loaded')) {
      fn();
      mutations.forEach((m) => {
        // Apply the desired operation on each mutation
        if (m.target.classList.contains('visibility-hidden')) {
          m.target.classList.remove('visibility-hidden');
        }
      });
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

async function getElementForProposition(proposition) {
  const selector = proposition.data.prehidingSelector
      || toCssSelector(proposition.data.selector);
  return document.querySelector(selector);
}

function escapeSelector(selector) {
  return selector.replaceAll(/#(\d)/g, '#\\3$1 ');
}
function getSectionByElementSelector(selector) {
  try {
    let section = document.querySelector(escapeSelector(selector));
    while (section && !section.classList.contains('section')) {
      section = section.parentNode;
    }
    return section;
  } catch (error) {
    return null; // Return null if an error occurs
  }
}

async function getAndApplyRenderDecisions() {
  // Get the decisions, but don't render them automatically
  // so we can hook up into the AEM EDS page load sequence
  const response = await window.alloy('sendEvent', { renderDecisions: false });
  const { propositions } = response;

  propositions.forEach((entry) => {
    // Iterate over the array of items in each entry
    if (entry.items) {
      entry.items.forEach((item) => {
        if (item.schema === 'https://ns.adobe.com/personalization/dom-action') {
          const cssSelector = item.data.selector;
          const { prehidingSelector } = item.data;
          let section;
          if (prehidingSelector) {
            section = getSectionByElementSelector(prehidingSelector);
          }
          if (!section && cssSelector) {
            section = getSectionByElementSelector(cssSelector);
          }
          if (section) {
            section.classList.add('visibility-hidden');
          }
        }
      });
    }
  });
  document.body.classList.add('appear');
  onDecoratedElement(async () => {
    await window.alloy('applyPropositions', { propositions });

    // keep track of propositions that were applied
    propositions.forEach((p) => {
      p.items = p.items.filter((i) => i.schema !== 'https://ns.adobe.com/personalization/dom-action' || !getElementForProposition(i));
    });
  });

  // Reporting is deferred to avoid long tasks
  window.setTimeout(() => {
    // Report shown decisions
    window.alloy('sendEvent', {
      xdm: {
        eventType: 'decisioning.propositionDisplay',
        _experience: {
          decisioning: { propositions },
        },
      },
    });
  });
}

async function sendAnalyticsEvent(xdmData) {
  // eslint-disable-next-line no-undef
  if (!alloy) {
    return Promise.resolve();
  }
  // eslint-disable-next-line no-undef
  return alloy('sendEvent', {
    documentUnloading: true,
    xdm: xdmData,
  });
}

/**
 * Basic tracking for page views with alloy
 * @param document
 * @param additionalXdmFields
 * @returns {Promise<*>}
 */
// eslint-disable-next-line no-unused-vars
async function analyticsTrackPageViews(document, additionalXdmFields = {}) {
  const xdmData = {
    eventType: 'web.webpagedetails.pageViews',
    web: {
      webPageDetails: {
        pageViews: {
          value: 1,
        },
        name: document.title,
      },
    },
  };
  sendAnalyticsEvent(xdmData);
}

async function initializeTargetAnalytics() {
  const alloyLoadedPromise = Promise.all([
    initWebSDK(`${window.hlx.codeBasePath}/scripts/alloy.min.js`),
    fetch(`${getHostUrl()}/websdkconfig.json`).then((response) => response.json()),
  ]);
  if (getMetadata('target')) {
    alloyLoadedPromise
      .then(async ([, configData]) => {
        window.alloy('configure', {
          datastreamId: configData.data[0].DatastreamId,
          orgId: configData.data[0].OrgId,
        });
        await getAndApplyRenderDecisions();
        await analyticsTrackPageViews(document);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error:', error);
      });
  }
  return alloyLoadedPromise;
}

/**
 * Returns script that initializes a queue for each alloy instance,
 * in order to be ready to receive events before the alloy library is loaded
 * Documentation
 * https://experienceleague.adobe.com/docs/experience-platform/edge/fundamentals/installing-the-sdk.html?lang=en#adding-the-code
 * @type {string}
 */
function initAlloyQueue(instanceName) {
  if (window[instanceName]) {
    return;
  }
  // eslint-disable-next-line no-underscore-dangle
  (window.__alloyNS ||= []).push(instanceName);
  window[instanceName] = (...args) => new Promise((resolve, reject) => {
    window.setTimeout(() => {
      window[instanceName].q.push([resolve, reject, args]);
    });
  });
  window[instanceName].q = [];
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
    initAlloyQueue('alloy');
    initializeTargetAnalytics();
    decorateMain(main);
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

  if (!isInternalPage()) {
    await loadHeader(doc.querySelector('header'));
    await loadFooter(doc.querySelector('footer'));
  }
  await loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  await loadFonts();

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
addPrefetch('preconnect', 'https://icicidirect-secure-worker.franklin-prod.workers.dev');
loadPage();
window.validateuserToken = '';
window.validateCaptchaToken = '';
