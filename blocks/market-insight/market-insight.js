import { readBlockConfig, fetchPlaceholders, decorateIcons } from '../../scripts/aem.js';
import {
  createElement, observe, postFormData, getResearchAPIUrl, parseResponse, SITE_ROOT,
  handleNoResults,
} from '../../scripts/blocks-utils.js';
import { handleSocialShareClick } from '../../scripts/social-utils.js';

const apiName = 'GetMarketInsights';
const defaultCardsCount = 3;
const MARKETINSIGHT_DIRECTORY = '/research/equity/market-insights/';

function getLink(permLink) {
  return SITE_ROOT + MARKETINSIGHT_DIRECTORY + permLink;
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

function buildCards(results, cards, cardCount, placeholders) {
  const powerBy = (placeholders.powerby ?? '').trim();
  const publishedOn = (placeholders.publishedon ?? '').trim();
  if (cardCount < defaultCardsCount) {
    cards.classList.add('central-cards');
  }
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
      aLink.href = getLink(result.PermLink);
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
    button.addEventListener('click', () => handleSocialShareClick(button));
    socialShare.append(button);
    powerby.append(socialShare);
    li.append(title);
    li.append(description);
    li.append(powerby);
    cards.append(li);
  }
}

async function decorateCards(block, placeholders, cards, cardCount) {
  const formData = new FormData();
  formData.append('apiName', apiName);
  formData.append('inputJson', `{ pageNo: 1, pageSize: ${cardCount} }`);
  postFormData(getResearchAPIUrl(), formData, (error, GetMarketInsights = []) => {
    if (error || !GetMarketInsights || !GetMarketInsights.Data) {
      const element = block.querySelector('.cards');
      handleNoResults(element);
    } else {
      const formattedData = parseResponse(GetMarketInsights);
      const results = sortResult(formattedData);
      buildCards(results, cards, cardCount, placeholders);
    }
  }, apiName);
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  const blockCfg = readBlockConfig(block);
  const title = decorateTitle(blockCfg);
  const cards = createElement('ul', 'cards');
  const cardCount = blockCfg.count ?? defaultCardsCount;
  const discoverMoreButton = decorateDiscoverMore(blockCfg, placeholders);
  block.textContent = '';
  block.append(title);
  block.append(cards);
  block.append(discoverMoreButton);
  observe(block, decorateCards, placeholders, cards, cardCount);
}
