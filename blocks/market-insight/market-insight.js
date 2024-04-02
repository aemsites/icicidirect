import { readBlockConfig, fetchPlaceholders, decorateIcons } from '../../scripts/aem.js';
import { createElement, observe } from '../../scripts/blocks-utils.js';

// TODO: This is dummy function that fetch sample data from EDS json.
// It will be replaced when API call is available.
async function fetchMarketInsightMockData() {
  let hostUrl = window.location.origin;
  if (!hostUrl || hostUrl === 'null') {
    // eslint-disable-next-line prefer-destructuring
    hostUrl = window.location.ancestorOrigins[0];
  }
  const apiUrl = `${hostUrl}/draft/jiang/marketinsight.json`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const results = data.data.map((result) => ({
      title: result.title,
      description: result.description,
      link: result.link,
      publishedon: result.publishedon,
    }));
    return results;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Failed to get API data: ', error);
    return [];
  }
}

function decorateTitle(blockCfg) {
  const { title } = blockCfg;
  const blockTitleDiv = createElement('div', 'title');
  const blockTitle = createElement('h2', '');
  blockTitle.textContent = title;
  blockTitleDiv.append(blockTitle);
  return blockTitleDiv;
}

function decorateDiscoverMore(blockCfg, placeholders) {
  const discoverMore = blockCfg['discover-more-link'];
  const discoverMoreDiv = createElement('div', 'discover-more');
  const aLink = createElement('a', '');
  aLink.target = '_blank';
  aLink.href = discoverMore;
  aLink.textContent = placeholders.discovermore;
  aLink.classList.add('discover-more-button');
  discoverMoreDiv.append(aLink);
  return discoverMoreDiv;
}

function createSocialButton(button, block) {
  const link = button.closest('li').querySelector('a').href;
  const encodeLink = encodeURIComponent(link);
  const encodeTitle = encodeURIComponent(document.title);
  const socialMap = new Map([
    ['whatsapp', `https://api.whatsapp.com/send?text=Hey! Check out this: ${encodeLink}`],
    ['facebook', `http://www.facebook.com/sharer.php?u=${encodeLink}&t=${encodeTitle},'sharer',toolbar=0,status=0,width=626,height=436`],
    ['linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${link}`],
    ['twitter', `https://twitter.com/intent/tweet?url=${link}`],
  ]);

  const alinks = block.querySelectorAll('.modal .modal-body li a');
  if (alinks && alinks.length > 0) {
    [...alinks].forEach((alink) => {
      if (!alink.classList.contains('copy-link')) {
        alink.href = socialMap.get(alink.className);
      }
    });
  }
}

function addSocialButtonEvent(button, block) {
  button.addEventListener('click', () => {
    const modal = block.querySelector('.modal');
    if (modal) {
      createSocialButton(button, block);
      modal.classList.toggle('visible');
      const body = document.querySelector('body');
      body.classList.toggle('modal-open');
    }
  });
}

async function decorateCards(block, placeholders, previousNode) {
  const results = await fetchMarketInsightMockData();
  const powerBy = (placeholders.powerby ?? '').trim();
  const publishedOn = (placeholders.publishedon ?? '').trim();
  const ul = createElement('ul', '');
  // show 3 cards by default
  for (let index = 0; index < (results.length > 3 ? 3 : results.length); index += 1) {
    const result = results[index];
    const li = createElement('li', '');
    const title = createElement('div', 'cards-title');
    const description = createElement('div', 'cards-description');
    const powerby = createElement('div', 'cards-powerby');
    // Cards title
    const h3 = createElement('h3', '');
    const aLink = createElement('a', '');
    aLink.href = result.link;
    aLink.target = '_blank';
    aLink.append(result.title);
    h3.append(aLink);
    title.append(h3);
    // Cards description
    description.innerHTML = decodeURIComponent(result.description);
    // Cards powerby
    const powerbyDiv = createElement('div', '');
    const powerbyContent = createElement('p', '');
    powerbyContent.textContent = powerBy;
    const publishedOnContent = createElement('p', '');
    const publishedon = result.publishedon.replaceAll(' ', '-');
    publishedOnContent.textContent = `${publishedOn} ${publishedon}`;
    powerbyDiv.append(powerbyContent);
    powerbyDiv.append(publishedOnContent);
    powerby.append(powerbyDiv);
    // Social share button
    const socialShare = createElement('div', 'socialshare');
    const button = createElement('button', '');
    const iconSpan = createElement('span', 'icon');
    iconSpan.classList.add('icon-gray-share-icon');
    button.append(iconSpan);
    decorateIcons(button);
    addSocialButtonEvent(button, block);
    socialShare.append(button);
    powerby.append(socialShare);
    li.append(title);
    li.append(description);
    li.append(powerby);
    ul.append(li);
  }
  const parentDiv = previousNode.parentNode;
  parentDiv.insertBefore(ul, previousNode);
}

function addModalCloseEvent(closeItem, modal) {
  closeItem.addEventListener('click', () => {
    modal.classList.toggle('visible');
    const body = document.querySelector('body');
    body.classList.toggle('modal-open');
  });
}

function addModalOuterCloseEvent(modal) {
  modal.addEventListener('click', (e) => {
    if (modal.classList.contains('visible') && e.target === modal) {
      modal.classList.toggle('visible');
      const body = document.querySelector('body');
      body.classList.toggle('modal-open');
    }
  });
}

function createSocialIcons(modalBody) {
  const div = createElement('div', '');
  const ul = createElement('ul', '');
  const socialList = ['whatsapp', 'facebook', 'linkedin', 'twitter', 'copy-link'];
  [...socialList].forEach((item) => {
    const li = createElement('li', '');
    const link = createElement('a', '');
    link.target = '_blank';
    link.classList.add(item);
    const img = createElement('img', '');
    img.src = `../../icons/${item}-icon.png`;
    img.alt = `${item}`;
    link.append(img);
    li.append(link);
    ul.append(li);
  });
  div.append(ul);
  modalBody.append(div);
}

function decorateModal(placeholders) {
  const modalTitleContent = (placeholders.modaltitle ?? '').trim();
  const modal = createElement('div', 'modal');
  const modaldialog = createElement('div', 'modal-dialog');
  const modalContent = createElement('div', 'modal-content');
  const modalBody = createElement('div', 'modal-body');
  const closeButton = createElement('button', 'close-button');
  const closeIcon = createElement('span', '');
  closeIcon.innerHTML = '&times;';
  closeButton.append(closeIcon);
  addModalCloseEvent(closeButton, modal);
  const modalTitle = createElement('div', '');
  const h3 = createElement('h3', '');
  const strongTag = createElement('strong', '');
  strongTag.append(modalTitleContent);
  h3.append(strongTag);
  modalTitle.append(h3);
  modalBody.append(modalTitle);
  createSocialIcons(modalBody);
  modalContent.append(modalBody);
  modalContent.append(closeButton);
  modaldialog.append(modalContent);
  modal.append(modaldialog);
  addModalOuterCloseEvent(modal);

  return modal;
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const blockCfg = readBlockConfig(block);
  const title = decorateTitle(blockCfg);
  const discoverMoreButton = decorateDiscoverMore(blockCfg, placeholders);
  const modal = decorateModal(placeholders);
  block.textContent = '';
  block.append(title);
  block.append(discoverMoreButton);
  block.append(modal);
  observe(block, decorateCards, placeholders, discoverMoreButton);
}
