import {
  sampleRUM,
  buildBlock,
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
  loadScript,
  createOptimizedPicture,
} from './aem.js';

import { decorateQuickLinks } from './blocks-utils.js';
import { getHostUrl } from './mockapi.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

function buildAppDowloadBlock(main) {
  const appDownloadSection = main.querySelector('.section.app-download');
  if (appDownloadSection && appDownloadSection.dataset.sectionStatus !== 'loaded') {
    const appDowloadDefaultWrapper = main.querySelector('.section.app-download .default-content-wrapper');

    const newContentWrapper = document.createElement('div');
    newContentWrapper.classList.add('app-download-wrapper');

    const contenDiv = document.createElement('div');

    const storeDiv = document.createElement('div');
    storeDiv.className = 'stores';

    const qrDiv = document.createElement('div');
    qrDiv.className = 'qrcode';

    const qrPictureTag = appDowloadDefaultWrapper.querySelector('picture');
    if (qrPictureTag.parentNode) {
      qrPictureTag.parentNode.remove();
    }
    qrDiv.appendChild(qrPictureTag);

    // Get the buttons from the original content wrapper
    const buttons = appDowloadDefaultWrapper.querySelectorAll('.button-container');
    buttons.forEach((button) => {
    // Get the anchor tag inside the button container
      const anchorTag = button.querySelector('a');
      const badgeName = anchorTag.text.toLowerCase();
      const picture = createOptimizedPicture(`${getHostUrl()}/icons/${badgeName}.png`);
      anchorTag.text = '';
      anchorTag.append(picture);
      // Move the anchor tag directly under the div
      storeDiv.appendChild(anchorTag);
      // Remove the button container paragraph
      button.remove();
    });

    // Move all children of defaultContentWrapper to newParentDiv
    while (appDowloadDefaultWrapper.firstChild) {
      contenDiv.appendChild(appDowloadDefaultWrapper.firstChild);
    }

    newContentWrapper.appendChild(contenDiv);
    newContentWrapper.appendChild(storeDiv);
    newContentWrapper.appendChild(qrDiv);

    appDowloadDefaultWrapper.parentNode.insertBefore(newContentWrapper, appDowloadDefaultWrapper);

    // Remove the default content wrapper
    appDowloadDefaultWrapper.remove();
  }
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
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
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
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateQuickLinks(main);
  buildAppDowloadBlock(main);
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
