import { readBlockConfig, fetchPlaceholders, decorateIcons } from '../../scripts/aem.js';
import { createElement, observe, SITE_ROOT } from '../../scripts/blocks-utils.js';
import { fetchRapidResultMockData } from '../../scripts/mockapi.js';
import { handleSocialShareClick } from '../../scripts/social-utils.js';

const defaultCardsCount = 4;
const defaultSideBySideCardsCount = 3;
const MARKETINSIGHT_DIRECTORY = '/research/equity/market-insights/';

function getLink(permLink) {
  return SITE_ROOT + MARKETINSIGHT_DIRECTORY + permLink;
}

function decorateTitle(titleContent) {
  const title = createElement('div', 'title');
  const h2 = createElement('h2', '');
  h2.textContent = (titleContent ?? '').trim();
  title.append(h2);
  return title;
}

function formatDate(date) {
  let result = '';
  const isInvalidDate = (validDate) => Number.isNaN(validDate.getDate());
  const dateObj = new Date(date);
  if (!isInvalidDate(dateObj)) {
    const hours = dateObj.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const dateArr = dateObj.toString().split(' ');
    const time = dateArr[4].split(':', 2).join(':');
    result = `${dateArr[2]} ${dateArr[1]} ${dateArr[3]} ${time} ${ampm}`;
  }
  return result;
}

function decorateDiscoverMore(blockCfg, placeholders) {
  const discoverMoreLink = blockCfg['discover-more-link'];
  const discoverMore = createElement('div', 'discover-more');
  const aLink = createElement('a', '');
  aLink.target = '_blank';
  aLink.href = discoverMoreLink;
  aLink.textContent = placeholders.discovermore;
  aLink.classList.add('discover-more-link');
  const icon = createElement('icon', 'discover-more-icon');
  aLink.append(icon);
  discoverMore.append(aLink);
  return discoverMore;
}

function sortResult(sortData) {
  const results = sortData.map((el) => {
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
  return results;
}

function buildCards(results, placeholders, cards, cardCount, blockCfg) {
  const coverImageConf = blockCfg['cover-image'];
  const coverImageCountConf = parseInt(blockCfg['number-of-cover-image'] ?? 0, 10);
  const loopNum = results.length > cardCount ? cardCount : results.length;
  if (cardCount === 1) {
    cards.classList.add('central-one-cards');
  }
  for (let index = 0; index < loopNum; index += 1) {
    const result = results[index];
    const li = createElement('li', '');
    const liWrapper = createElement('div', 'company-result');
    const title = createElement('div', 'cards-title');
    const description = createElement('div', 'cards-description');
    const powerby = createElement('div', 'cards-powerby');
    // Cards title
    const titleIcon = createElement('div', 'title-icon');
    const titleIconSpan = createElement('span', 'icon');
    titleIconSpan.classList.add('icon-icici-icon');
    titleIcon.append(titleIconSpan);
    decorateIcons(titleIcon);
    const h3 = createElement('h3', '');
    const titleContent = result.Title ?? '';
    if (result.PermLink) {
      const aLink = createElement('a', '');
      aLink.href = getLink(result.PermLink);
      aLink.target = '_blank';
      aLink.append(titleContent);
      h3.append(aLink);
    } else {
      h3.textContent = titleContent;
    }
    const pTag = createElement('p', '');
    pTag.textContent = formatDate(result.PublishedOnDate);
    h3.append(pTag);
    title.append(titleIcon);
    title.append(h3);
    // Cards description
    description.innerHTML = decodeURIComponent(result.ShortDescription ?? '');
    // Cards powerby
    const viewMoreDiv = createElement('div', '');
    const viewMoreLink = createElement('a', 'view-more-link');
    if (result.PermLink) {
      viewMoreLink.href = getLink(result.PermLink);
      viewMoreLink.target = '_blank';
    }
    viewMoreLink.append((placeholders.viewmore ?? '').trim());
    viewMoreDiv.append(viewMoreLink);
    powerby.append(viewMoreDiv);
    // Social share button
    const socialShare = createElement('div', 'social-share');
    const button = createElement('button', '');
    const iconSpan = createElement('span', 'icon');
    iconSpan.classList.add('icon-gray-share-icon');
    button.append(iconSpan);
    decorateIcons(button);
    button.addEventListener('click', () => handleSocialShareClick(button));
    socialShare.append(button);
    powerby.append(socialShare);
    liWrapper.append(title);
    liWrapper.append(description);
    liWrapper.append(powerby);
    if (index >= (loopNum - coverImageCountConf) && coverImageConf) {
      const coverImage = createElement('div', 'cover-image');
      coverImage.style.backgroundImage = `url(${coverImageConf})`;
      liWrapper.classList.add('covered');
      li.append(coverImage);
    }
    li.append(liWrapper);
    cards.append(li);
  }
}

async function decorateCards(block, placeholders, cards, cardCount) {
  const queryObj = await fetchRapidResultMockData();
  const results = sortResult(queryObj);
  if (cardCount < defaultCardsCount) {
    cards.classList.add('central-cards');
  }
  const blockCfg = readBlockConfig(block);
  buildCards(results, placeholders, cards, cardCount, blockCfg);
}

async function decorateSideBySideCards(block, placeholders) {
  const queryObj = await fetchRapidResultMockData();
  if (!queryObj || queryObj.length <= 1) {
    block.closest('.section').classList.remove('layout-60-40');
    block.innerHTML = '';
    block.style.display = 'none';
    return;
  }
  const blockCfg = readBlockConfig(block);
  const { title } = blockCfg;
  const cards = createElement('ul', '');
  const cardCount = parseInt(blockCfg['card-count'] ?? defaultSideBySideCardsCount, 10);
  if (cardCount < defaultSideBySideCardsCount) {
    cards.classList.add('central-cards');
  }
  const topTitle = decorateTitle(title);
  const mainContent = createElement('div', 'main-content');
  const mainWrapper = createElement('div', 'main-wrapper');
  const discoverMoreButton = decorateDiscoverMore(blockCfg, placeholders);
  mainWrapper.append(cards);
  mainWrapper.append(discoverMoreButton);
  mainContent.append(mainWrapper);
  block.textContent = '';
  block.append(topTitle);
  block.append(mainContent);

  const results = sortResult(queryObj);
  buildCards(results, placeholders, cards, cardCount, blockCfg);
}

export default async function decorate(block) {
  const sideBySide = block.classList.contains('side-by-side');
  const placeholders = await fetchPlaceholders();
  if (sideBySide) {
    [...block.children].forEach((configElement) => {
      configElement.style.display = 'none';
    });
    observe(block, decorateSideBySideCards, placeholders);
  } else {
    const blockCfg = readBlockConfig(block);
    const { title } = blockCfg;
    const { subtitle } = blockCfg;
    const cards = createElement('ul', '');
    const cardCount = parseInt(blockCfg['card-count'] ?? defaultCardsCount, 10);
    const topTitle = decorateTitle(title);
    const mainContent = createElement('div', 'main-content');
    const mainWrapper = createElement('div', 'main-wrapper');
    const contentTitle = decorateTitle(subtitle);
    const discoverMoreButton = decorateDiscoverMore(blockCfg, placeholders);
    mainWrapper.append(contentTitle);
    mainWrapper.append(cards);
    mainWrapper.append(discoverMoreButton);
    mainContent.append(mainWrapper);
    block.textContent = '';
    block.append(topTitle);
    block.append(mainContent);
    observe(block, decorateCards, placeholders, cards, cardCount);
  }
}
