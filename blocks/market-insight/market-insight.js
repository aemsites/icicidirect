import { readBlockConfig, fetchPlaceholders, decorateIcons } from '../../scripts/aem.js';
import { createElement, observe } from '../../scripts/blocks-utils.js';
import { fetchMarketInsightMockData } from '../../scripts/mockapi.js';

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

async function decorateCards(block, placeholders, cardCount, previousNode) {
  const queryObj = await fetchMarketInsightMockData();
  const results = queryObj.map((el) => {
    if (!el.PublishedOnDate) return el;
    const elArr = el.PublishedOnDate.split(' ');
    const publishDate = elArr[0];
    const publishTime = elArr[1];
    const formatPublishDate = publishDate.split('-').reverse();
    el.PublishedOnDate = `${formatPublishDate} ${publishTime}`;
    return el;
  }).sort((a, b) => {
    const dateA = new Date(a.PublishedOnDate);
    const dateB = new Date(b.PublishedOnDate);
    return dateB - dateA;
  });

  const powerBy = (placeholders.powerby ?? '').trim();
  const publishedOn = (placeholders.publishedon ?? '').trim();
  const ul = createElement('ul', '');
  const loopNum = results.length > cardCount ? cardCount : results.length;
  for (let index = 0; index < loopNum; index += 1) {
    const result = results[index];
    const li = createElement('li', '');
    const title = createElement('div', 'cards-title');
    const description = createElement('div', 'cards-description');
    const powerby = createElement('div', 'cards-powerby');
    // Cards title
    const h3 = createElement('h3', '');
    const titleContent = result.Title ?? '';
    if (result.PermLink) {
      const aLink = createElement('a', '');
      aLink.href = result.PermLink;
      aLink.target = '_blank';
      aLink.append(titleContent);
      h3.append(aLink);
    } else {
      h3.textContent = titleContent;
    }
    title.append(h3);
    // Cards description
    description.innerHTML = decodeURIComponent(result.ShortDescription ?? '');
    // Cards powerby
    const powerbyDiv = createElement('div', '');
    const powerbyContent = createElement('p', '');
    powerbyContent.textContent = powerBy;
    const publishedOnContent = createElement('p', '');
    const publishOndate = result.PublishedOn ? result.PublishedOn.replaceAll(' ', '-') : '';
    publishedOnContent.textContent = `${publishedOn} ${publishOndate}`;
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
  const cardCount = blockCfg.count ?? 3;
  const discoverMoreButton = decorateDiscoverMore(blockCfg, placeholders);
  const modal = decorateModal(placeholders);
  block.textContent = '';
  block.append(title);
  block.append(discoverMoreButton);
  block.append(modal);
  observe(block, decorateCards, placeholders, cardCount, discoverMoreButton);
}
