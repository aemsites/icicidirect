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
} from './aem.js';

import {
  decorateQuickLinks,
  defaultAnalyticsLoadDisabled, loadAdobeLaunch,
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

  loadAdobeLaunch();
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
loadPage();

window.validateuserToken = '';

window.validateCaptchaToken = '';
