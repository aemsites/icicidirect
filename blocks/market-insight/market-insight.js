import { readBlockConfig, fetchPlaceholders } from '../../scripts/aem.js';
import { createDiv } from '../../scripts/blocks-utils.js';

// TODO: This is dummy function that fetch sample data from EDS json.
// It will be replaced when API call is available.
async function fetchMarketInsightMockData() {
  const hostUrl = window.location.origin;
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
    return [];
  }
}

function decorateTitle(blockCfg) {
  const { title } = blockCfg;
  const blockTitleDiv = createDiv('div', 'title');
  const blockTitle = createDiv('h2', '');
  blockTitle.textContent = title;
  blockTitleDiv.append(blockTitle);
  return blockTitleDiv;
}

function decorateDiscoverMore(blockCfg, placeholders) {
  const discoverMore = blockCfg['discover-more-link'];
  const discoverMoreDiv = createDiv('div', 'discover-more');
  const aLink = createDiv('a', '');
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
    ['facebook', `http://www.facebook.com/sharer.php?u="${encodeLink}&t=${encodeTitle},'sharer', 'toolbar=0,status=0,width=626,height=436`],
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

function decorateCards(results, blockCfg, block) {
  const powerBy = (blockCfg['power-by'] ?? '').trim().toLowerCase();
  const publishedOn = (blockCfg['published-on'] ?? '').trim().toLowerCase();
  const ul = createDiv('ul', '');
  // show 3 cards by default
  for (let index = 0; index < (results.length > 3 ? 3 : results.length); index += 1) {
    const result = results[index];
    const li = createDiv('li', '');
    const title = createDiv('div', 'cards-title');
    const description = createDiv('div', 'cards-description');
    const powerby = createDiv('div', 'cards-powerby');
    // Cards title
    const h3 = createDiv('h3', '');
    const aLink = createDiv('a', '');
    aLink.href = result.link;
    aLink.target = '_blank';
    aLink.append(result.title);
    h3.append(aLink);
    title.append(h3);
    // Cards description
    description.innerHTML = decodeURIComponent(result.description);
    // Cards powerby
    const powerbyDiv = createDiv('div', '');
    const powerbyContent = createDiv('p', '');
    powerbyContent.textContent = powerBy;
    const publishedOnContent = createDiv('p', '');
    publishedOnContent.textContent = `${publishedOn} ${result.publishedon}`;
    powerbyDiv.append(powerbyContent);
    powerbyDiv.append(publishedOnContent);
    powerby.append(powerbyDiv);
    // Social share button
    const socialShare = createDiv('div', 'socialshare');
    const button = createDiv('button', '');
    const image = createDiv('img', '');
    image.src = '../../icons/gray-share-icon.svg';
    image.alt = 'gray-share-icon';
    button.append(image);
    addSocialButtonEvent(button, block);
    socialShare.append(button);
    powerby.append(socialShare);
    li.append(title);
    li.append(description);
    li.append(powerby);
    ul.append(li);
  }
  return ul;
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
  const div = createDiv('div', '');
  const ul = createDiv('ul', '');
  const socialList = ['whatsapp', 'facebook', 'linkedin', 'twitter', 'copy-link'];
  [...socialList].forEach((item) => {
    const li = createDiv('li', '');
    const link = createDiv('a', '');
    link.target = '_blank';
    link.classList.add(item);
    const img = createDiv('img', '');
    img.src = `../../icons/${item}-icon.png`;
    img.alt = `${item}`;
    link.append(img);
    li.append(link);
    ul.append(li);
  });
  div.append(ul);
  modalBody.append(div);
}

function decorateModal(blockCfg) {
  const modalTitleContent = (blockCfg['modal-title'] ?? '');
  const modal = createDiv('div', 'modal');
  const modalDislog = createDiv('div', 'modal-dislog');
  const modalContent = createDiv('div', 'modal-content');
  const modalBody = createDiv('div', 'modal-body');
  const closeButton = createDiv('button', 'close-button');
  const closeIcon = createDiv('span', '');
  closeIcon.innerHTML = '&times;';
  closeButton.append(closeIcon);
  addModalCloseEvent(closeButton, modal);
  const modalTitle = createDiv('div', '');
  const h3 = createDiv('h3', '');
  const strongTag = createDiv('strong', '');
  strongTag.append(modalTitleContent);
  h3.append(strongTag);
  modalTitle.append(h3);
  modalBody.append(modalTitle);
  createSocialIcons(modalBody);
  modalContent.append(modalBody);
  modalContent.append(closeButton);
  modalDislog.append(modalContent);
  modal.append(modalDislog);
  addModalOuterCloseEvent(modal);

  return modal;
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const blockCfg = readBlockConfig(block);
  const title = decorateTitle(blockCfg);
  const discoverMoreButton = decorateDiscoverMore(blockCfg, placeholders);
  const results = await fetchMarketInsightMockData();
  const mainContent = decorateCards(results, blockCfg, block);
  const modal = decorateModal(blockCfg);
  block.textContent = '';
  block.append(title);
  block.append(mainContent);
  block.append(discoverMoreButton);
  block.append(modal);
}
