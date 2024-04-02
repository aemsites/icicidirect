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
  fetchPlaceholders,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

let isSocialShareDialogInitializing = false;

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

export async function handleSocialShareClick(link) {
  const dialogs = document.querySelectorAll('dialog.social-share');
  const placeholders = await fetchPlaceholders();

  if (isSocialShareDialogInitializing) {
    return;
  }

  let dialogAlreadyExists = false;

  dialogs.forEach((d) => {
    if (d.dataset?.link === link) {
      d.showModal();
      dialogAlreadyExists = true;
    }
  });

  if (dialogAlreadyExists) {
    return;
  }

  isSocialShareDialogInitializing = true;

  const dialog = document.createElement('dialog');
  dialog.dataset.link = link;
  dialog.classList.add('social-share');

  const divContainer = document.createElement('div');

  const closeButton = document.createElement('button');
  closeButton.classList.add('close-button');
  closeButton.innerHTML = '&times;';

  function handleDialogClose() {
    isSocialShareDialogInitializing = false;
    dialog.close();
  }

  closeButton.addEventListener('click', () => handleDialogClose());
  dialog.addEventListener('close', () => handleDialogClose());

  divContainer.appendChild(closeButton);

  const dialogTitle = document.createElement('h4');
  dialogTitle.textContent = (
    placeholders.modaltitle ?? 'Share Article Link Via:'
  ).trim();
  divContainer.appendChild(dialogTitle);

  const dialogContent = document.createElement('div');
  dialogContent.classList.add('modal-body');

  const encodeLink = encodeURIComponent(link);
  const encodeTitle = encodeURIComponent(document.title);

  const socialPlatforms = [
    {
      name: 'Twitter',
      icon: '/icons/twitter-icon.png',
      shareUrl: `https://twitter.com/intent/tweet?url=${encodeLink}`,
    },
    {
      name: 'Facebook',
      icon: '/icons/facebook-icon.png',
      shareUrl: `http://www.facebook.com/sharer.php?u=${encodeLink}&t=${encodeTitle},'sharer',toolbar=0,status=0,width=626,height=436`,
    },
    {
      name: 'WhatsApp',
      icon: '/icons/whatsapp-icon.png',
      shareUrl: `https://api.whatsapp.com/send?text=Hey! Check out this: ${encodeLink}`,
    },
    {
      name: 'LinkedIn',
      icon: '/icons/linkedin-icon.png',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeLink}`,
    },
    { name: 'CopyLink', icon: '/icons/copy-link-icon.png' },
  ];

  socialPlatforms.forEach((platform) => {
    const icon = document.createElement('img');
    icon.src = platform.icon;
    icon.alt = platform.name;
    icon.classList.add('social-icon');
    if (platform.shareUrl) {
      icon.onclick = () => window.open(platform.shareUrl, '_blank');
    } else if (platform.name === 'CopyLink') {
      icon.onclick = () => {
        navigator.clipboard.writeText(link);
      };
    }
    dialogContent.appendChild(icon);
  });
  divContainer.appendChild(dialogContent);
  dialog.appendChild(divContainer);
  document.body.appendChild(dialog);

  dialog.showModal();
}
