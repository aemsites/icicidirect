import { readBlockConfig, fetchPlaceholders, decorateIcons } from '../../scripts/aem.js';
import {
  createElement, handleNoResults, observe, postFormData, getResearchAPIUrl,
  SITE_ROOT,
} from '../../scripts/blocks-utils.js';
import { handleSocialShareClick } from '../../scripts/social-utils.js';

const apiName = 'GetRapidResults';
const defaultCardsCount = 4;
const RAPIDRESULT_DIRECTORY = '/research/equity/rapid-results/';

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

function sortResult(sortData) {
  const results = sortData.sort((a, b) => {
    const dateA = new Date(a.pubDate);
    const dateB = new Date(b.pubDate);
    return dateB - dateA;
  });
  return results;
}

function generateViewMoreLink(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/[^0-9a-z\s]/gi, '')
      .replace(/\s/g, '-')
    : '';
}

function getLink(stockName) {
  return SITE_ROOT + RAPIDRESULT_DIRECTORY + generateViewMoreLink(stockName);
}

function buildCards(results, cards, cardCount, placeholders) {
  const loopNum = results.length > cardCount ? cardCount : results.length;
  if (loopNum === 1) {
    cards.classList.add('central-cards-1');
  } else if (loopNum < defaultCardsCount) {
    cards.classList.add('central-cards');
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
    const titleContent = result.stockName ?? '';
    h3.textContent = titleContent;
    const pTag = createElement('p', '');
    pTag.textContent = formatDate(result.pubDate);
    h3.append(pTag);
    title.append(titleIcon);
    title.append(h3);
    // Cards description
    description.innerHTML = result.title ?? '';
    // Cards powerby
    const viewMoreDiv = createElement('div', '');
    const viewMoreLink = createElement('a', 'view-more-link');
    if (result.stockName) {
      viewMoreLink.href = getLink(result.stockName);
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
    li.append(liWrapper);
    cards.append(li);
  }
}

async function decorateCards(block, placeholders, cards, cardCount) {
  const formData = new FormData();
  formData.append('apiName', apiName);
  postFormData(getResearchAPIUrl(), formData, (error, GetRapidResult = []) => {
    if (!GetRapidResult || !GetRapidResult.Data || cardCount === 0
      || GetRapidResult.Data.length === 0) {
      handleNoResults(cards);
      return;
    }
    const results = sortResult(GetRapidResult.Data);
    buildCards(results, cards, cardCount, placeholders);
  }, apiName);
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

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const blockCfg = readBlockConfig(block);
  const { title } = blockCfg;
  const { subtitle } = blockCfg;
  const cardCountCfg = blockCfg.count ?? defaultCardsCount;
  const cardCount = cardCountCfg > defaultCardsCount ? defaultCardsCount : cardCountCfg;
  const topTitle = decorateTitle(title);
  const cards = createElement('ul', '');
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
