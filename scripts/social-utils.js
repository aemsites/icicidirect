import { fetchPlaceholders } from './aem.js';

let isSocialShareDialogInitializing = false;

function handleBodyScrollOnModalOpen() {
  if (!document.body.classList.contains('modal-open')) {
    document.body.classList.add('modal-open');
  }
}

function handleBodyScrollOnModalClose() {
  if (document.body.classList.contains('modal-open')) {
    document.body.classList.remove('modal-open');
  }
}

/**
 * Click event handler for social share anchors.
 * Opens the social share dialog having social buttons.
 *
 * @param {Element} anchor - The anchor element clicked.
 */
export async function handleSocialShareClick(anchor) {
  const dialogs = document.querySelectorAll('dialog.social-share');
  const placeholders = await fetchPlaceholders();
  const link = anchor.closest('li')?.querySelector('a').href ?? anchor.dataset?.href;

  if (isSocialShareDialogInitializing) {
    return;
  }

  let dialogAlreadyExists = false;

  dialogs.forEach((d) => {
    if (d.dataset?.link === link) {
      d.showModal();
      dialogAlreadyExists = true;
      handleBodyScrollOnModalOpen();
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
    handleBodyScrollOnModalClose();
  }

  function handleDialogClick(event) {
    // Close the dialog if the user clicks outside the dialog
    if (event.target === dialog) {
      handleDialogClose();
    }
  }

  closeButton.addEventListener('click', () => handleDialogClose());
  dialog.addEventListener('close', () => handleDialogClose());
  dialog.addEventListener('click', handleDialogClick);

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
  handleBodyScrollOnModalOpen();
}

/**
 * Decorates the specified anchor elements with the 'social-share' class
 * if they contain icon 'gray-share-icon.svg'.
 * Adds a click event listener to each decorated anchor element.
 * @param {Array<Element>} anchorElements - The anchor elements to decorate.
 * @param {Element} block - The block element containing the modal.
 * @param {Function} createSocialButton - The function to create the social button.
 * @returns {void}
 */
export function decorateSocialShare(anchorElements) {
  anchorElements.forEach((anchor) => {
    anchor.classList.add('social-share');
    if (anchor.href) {
      anchor.dataset.href = anchor.href;
      anchor.removeAttribute('href');
    }
    anchor.addEventListener('click', () => handleSocialShareClick(anchor));
  });
}
