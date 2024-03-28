import { readBlockConfig, fetchPlaceholders, decorateIcons } from '../../scripts/aem.js';
import { createElement, observe } from '../../scripts/blocks-utils.js';

// TODO: This is dummy function that fetch sample data from EDS json.
// It will be replaced when API call is available.
async function fetchRapidResultMockData() {
  let hostUrl = window.location.origin;
  if (!hostUrl || hostUrl === 'null') {
    // eslint-disable-next-line prefer-destructuring
    hostUrl = window.location.ancestorOrigins[0];
  }
  const apiUrl = `${hostUrl}/draft/jiang/rapidresult.json`;
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

function decorateTitle(titleContent) {
  const title = createElement('div', 'title');
  const h2 = createElement('h2', '');
  h2.textContent = (titleContent ?? '').trim();
  title.append(h2);
  return title;
}

function decorateCards(block, placeholders, results) {
  const ul = createElement('ul', '');
  // show 4 cards by default
  for (let index = 0; index < (results.length > 4 ? 4 : results.length); index += 1) {
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
    if (result.link) {
      const aLink = createElement('a', '');
      aLink.href = result.link;
      aLink.target = '_blank';
      aLink.append(result.title);
      h3.append(aLink);
    } else {
      h3.textContent = result.title;
    }
    const pTag = createElement('p', '');
    pTag.textContent = result.publishedon;
    h3.append(pTag);
    title.append(titleIcon);
    title.append(h3);
    // Cards description
    description.innerHTML = decodeURIComponent(result.description);
    // Cards powerby
    const viewMoreDiv = createElement('div', '');
    const viewMoreLink = createElement('a', 'view-more-link');
    if (result.link) {
      viewMoreLink.href = result.link;
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
    if (result.link) {
    //   addSocialButtonEvent(button, block);
    }
    socialShare.append(button);
    powerby.append(socialShare);
    liWrapper.append(title);
    liWrapper.append(description);
    liWrapper.append(powerby);
    li.append(liWrapper);
    ul.append(li);
  }
  return ul;
  // const parentDiv = previousNode.parentNode;
  // parentDiv.insertBefore(ul, previousNode);
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
  const topTitle = decorateTitle(title);
  const mainContent = createElement('div', 'main-content');

  const mainWrapper = createElement('div', 'main-wrapper');
  const contentTitle = decorateTitle(subtitle);
  const results = await fetchRapidResultMockData();
  const contentCards = decorateCards(block, placeholders, results);

  // Discover More
  const discoverMoreButton = decorateDiscoverMore(blockCfg, placeholders);

  mainWrapper.append(contentTitle);
  mainWrapper.append(contentCards);
  mainWrapper.append(discoverMoreButton);
  mainContent.append(mainWrapper);

//   const modal = decorateModal(placeholders);
  block.textContent = '';
  block.append(topTitle);
  block.append(mainContent);
//   block.append(modal);
//   observe(block, decorateCards, placeholders, discoverMoreButton);
}