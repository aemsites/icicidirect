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
} from './aem.js';

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
 * Click event handler for social share anchors.
 * Opens the social share dialog having social buttons.
 *
 * @param {Element} anchor - The anchor element clicked.
 */
export function handleSocialShareClick(anchor) {
  let dialog = document.querySelector('dialog.social-share');

  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.classList.add('social-share');

    // Create the close button (cross mark)
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => dialog.close());

    dialog.appendChild(closeButton);

    const dialogTitle = document.createElement('h3');
    dialogTitle.textContent = 'Share Article Link Via:';

    dialog.appendChild(dialogTitle);

    // Create the dialog content
    const dialogContent = document.createElement('div');
    dialogContent.classList.add('modal-body');

    const link = anchor.closest('li').querySelector('a').href;
    const encodeLink = encodeURIComponent(link);
    const encodeTitle = encodeURIComponent(document.title);

    const socialPlatforms = [
      { name: 'Twitter', icon: '/icons/twitter-icon.png', shareUrl: `https://twitter.com/intent/tweet?url=${encodeLink}` },
      { name: 'Facebook', icon: '/icons/facebook-icon.png', shareUrl: `http://www.facebook.com/sharer.php?u=${encodeLink}&t=${encodeTitle},'sharer',toolbar=0,status=0,width=626,height=436` },
      { name: 'WhatsApp', icon: '/icons/whatsapp-icon.png', shareUrl: `https://api.whatsapp.com/send?text=Hey! Check out this: ${encodeLink}` },
      { name: 'LinkedIn', icon: '/icons/linkedin-icon.png', shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeLink}` },
      { name: 'CopyLink', icon: '/icons/copy-link-icon.png' }
    ];

    socialPlatforms.forEach(platform => {
      const icon = document.createElement('img');
      icon.src = platform.icon;
      icon.alt = platform.name;
      icon.classList.add('social-icon');
      if (platform.shareUrl) {
        icon.onclick = () => window.open(platform.shareUrl.replace('YOUR_URL_HERE', encodeURIComponent(window.location.href)), '_blank');
      }
      dialogContent.appendChild(icon);
    });

    dialog.appendChild(dialogContent);

    document.body.appendChild(dialog);
  }

  // Show the dialog
  dialog.showModal();
}

/**
 * Decorates the specified anchor elements with the 'social-share' class if they contain icon 'gray-share-icon.svg'.
 * Adds a click event listener to each decorated anchor element.
 * @param {Array<Element>} anchorElements - The anchor elements to decorate.
 * @param {Element} block - The block element containing the modal.
 * @param {Function} createSocialButton - The function to create the social button.
 * @returns {void}
 */
function decorateSocialShare(anchorElements) {
  anchorElements.forEach(anchor => {
    anchor.classList.add('social-share');
    anchor.addEventListener('click', () => handleSocialShareClick(anchor));
  });
}

/**
 * Adds the 'discover-more' class to the specified anchor elements if their text content contains "Discover More".
 * @param {Array<Element>} anchorElements - The anchor elements to decorate.
 * @returns {void}
 */
function decorateDiscoverMore(anchorElements) {
  anchorElements.forEach(anchor => {
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
  const discoverMoreAnchors = anchors.filter(anchor => {
    return anchor.textContent.includes('DISCOVER MORE') && anchor.childElementCount === 0;
  });

  if (discoverMoreAnchors.length > 0) {
    decorateDiscoverMore(discoverMoreAnchors);
  }

  const socialShareAnchors = anchors.filter(anchor => {
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
  decorateAnchors(main);
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

loadPage();
