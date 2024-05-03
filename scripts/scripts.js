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

import { decorateQuickLinks } from './blocks-utils.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

// Add you templates below
// window.hlx.templates.add('/templates/my-template');

// Add you plugins below
// window.hlx.plugins.add('/plugins/my-plugin.js');

// eslint-disable-next-line no-shadow
// const position = navigator.geolocation.getCurrentPosition((position) => {
//   console.log(position.coords.latitude, position.coords.longitude);
//   return position;
// });

const AUDIENCES = {
  mobile: () => window.innerWidth < 600,
  desktop: () => window.innerWidth >= 600,
  delhi: async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      console.log(position.coords.latitude, position.coords.longitude);
      const { latitude, longitude } = position.coords;
      return (latitude >= 28.3 && latitude <= 28.9) && (longitude >= 77 && longitude <= 77.4);
    } catch (error) {
      console.error('Error getting location:', error);
      return false; // Return a default value in case of error
    }
  },
  mumbai: async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      console.log(position.coords.latitude, position.coords.longitude);
      const { latitude, longitude } = position.coords;
      return (latitude >= 18.9 && latitude <= 19.3) && (longitude >= 72.75 && longitude <= 72.95);
    } catch (error) {
      console.error('Error getting location:', error);
      return false; // Return a default value in case of error
    }
  },

  // define your custom audiences here as needed
};

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

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
// eslint-disable-next-line no-unused-vars
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
// eslint-disable-next-line no-unused-vars
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

  await window.hlx.plugins.run('loadEager');

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
  if ((getMetadata('experiment')
      || Object.keys(getAllMetadata('campaign')).length
      || Object.keys(getAllMetadata('audience')).length)) {
    // eslint-disable-next-line import/no-relative-packages
    const { loadLazy: runLazy } = await import('../plugins/experimentation/src/index.js');
    await runLazy(document, { audiences: AUDIENCES }, pluginContext);
  }

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
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
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
