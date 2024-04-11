import { toClassName } from '../../scripts/aem.js';
import {
  Viewport, createPictureElement, observe, fetchData,
} from '../../scripts/blocks-utils.js';
import { getHostUrl } from '../../scripts/mockapi.js';
import { handleSocialShareClick } from '../../scripts/social-utils.js';

function allowedCardsCount() {
  const deviceType = Viewport.getDeviceType();
  switch (deviceType) {
    case 'Desktop':
      return 3;
    case 'Tablet':
      return 2;
    default:
      return 1;
  }
}

function numberOfDots(totalCards, maxAllowedCards) {
  if (totalCards > maxAllowedCards) return totalCards - maxAllowedCards + 1;
  return 0;
}

function openUrl(event) {
  window.location.href = event.currentTarget.getAttribute('share-link');
}

function startCaraousal() {
  let nextIndex = 1;
  let direction = 1;
  const intervalId = setInterval(() => {
    const tabPanel = document.querySelector('.tabs-panel[aria-hidden="false"]');
    const track = tabPanel.querySelector('.track');
    const trackWidth = track.offsetWidth;
    const dotsContainer = tabPanel.querySelector('.dots-container');
    const dotsArray = dotsContainer.children;
    const cardWidth = trackWidth / allowedCardsCount();
    const cards = Array.from(track.children);
    cards.forEach((card) => {
      card.style.width = `${cardWidth}px`;
    });
    const totalCards = track.children.length;

    const totalMoves = numberOfDots(totalCards, allowedCardsCount()) - 1;
    if (nextIndex === totalMoves) {
      direction = -1;
    } else if (nextIndex === 0) {
      direction = 1;
    }
    if (nextIndex <= totalMoves) {
      dotsContainer.querySelector('.active').classList.remove('active');
      dotsArray[nextIndex].classList.add('active');
      const moveDistance = cardWidth * nextIndex;
      track.style.transform = `translateX(-${moveDistance}px)`;
      if (direction === 1) nextIndex += 1;
      else nextIndex -= 1;
    }
  }, 4000);
  return intervalId;
}

function clearIntervalAndReset(intervalId) {
  clearInterval(intervalId);
  const tabPanel = document.querySelector('.tabs-panel[aria-hidden="true"]');
  const dotsContainer = tabPanel.querySelector('.dots-container');
  const track = tabPanel.querySelector('.track');
  track.style.transform = 'translateX(-0px)';
  Array.from(dotsContainer.querySelectorAll('.active')).forEach((dot) => {
    dot.classList.remove('active');
  });
  if (dotsContainer.firstElementChild) {
    dotsContainer.firstElementChild.classList.add('active');
  }
}

let intervalId = 1;

function targetedDotView(event) {
  const targetDotIndex = event.currentTarget.dataset.index;
  clearInterval(intervalId);
  const tabPanel = document.querySelector('.tabs-panel[aria-hidden="false"]');
  const track = tabPanel.querySelector('.track');
  const dotsContainer = tabPanel.querySelector('.dots-container');
  dotsContainer.querySelector('.active').classList.remove('active');
  event.currentTarget.classList.add('active');
  const cardSize = track.firstElementChild.offsetWidth;
  const moveDistance = (targetDotIndex - 1) * cardSize;
  track.style.transform = `translateX(-${moveDistance}px)`;
}

function createCardMetaElement(...cardMetaValues) {
  const postMeta = document.createElement('div');
  postMeta.classList.add('card-meta');
  // Iterate through the values
  cardMetaValues.forEach((value) => {
    const abbr = document.createElement('abbr');
    abbr.textContent = value;
    postMeta.appendChild(abbr);
  });
  return postMeta;
}

function createPostTitle(item) {
  const postTitle = document.createElement('h3');
  postTitle.classList.add('card-title');
  const postLink = document.createElement('a');
  postLink.setAttribute('href', item.shareLink);
  postLink.setAttribute('target', '_blank');
  postLink.textContent = item.title;
  postTitle.appendChild(postLink);
  return postTitle;
}

function createSocialLinkElement(item) {
  const socialLink = document.createElement('div');
  socialLink.classList.add('social-link');
  const socialAnchor = document.createElement('a');
  const socialIcon = document.createElement('i');
  socialIcon.classList.add('fa', 'fa-share', 'icon');
  socialAnchor.dataset.href = item.shareLink;
  socialAnchor.addEventListener('click', () => handleSocialShareClick(socialAnchor));
  socialAnchor.appendChild(socialIcon);
  socialLink.appendChild(socialAnchor);
  return socialLink;
}

async function createPicture(imageUrl, mediaWrapper) {
  mediaWrapper.appendChild(createPictureElement(imageUrl, 'mqdefault', false));
}

function createCards(container, data, tabId) {
  const cardWidth = container.offsetWidth / allowedCardsCount();

  data.forEach((item) => {
    // Create slide element
    const card = document.createElement('div');
    card.className = 'slide-card';
    if (cardWidth > 0) {
      card.style.width = `${cardWidth}px`;
    }

    // Create cardInfo element
    const cardInfo = document.createElement('div');
    cardInfo.classList.add('card-info', `${tabId}-card`);

    // Create picture-wrapper element
    const mediaWrapper = document.createElement('div');
    mediaWrapper.classList.add('picture-wrapper');
    mediaWrapper.setAttribute('share-link', item.shareLink);
    mediaWrapper.addEventListener('click', (event) => {
      openUrl(event);
    });

    createPicture(item.imageUrl, mediaWrapper);
    // Create text-content element
    const textContent = document.createElement('div');
    textContent.classList.add('text-content');

    // Append all elements to text-content
    switch (tabId.toLowerCase()) {
      case 'videos':
        textContent.appendChild(createCardMetaElement(item.date, item.author));
        break;
      case 'podcasts':
        textContent.appendChild(createCardMetaElement(item.date, item.duration));
        break;
      default:
        break;
    }
    textContent.appendChild(createPostTitle(item));
    textContent.appendChild(createSocialLinkElement(item));

    // Append picture-wrapper and text-content to cardInfo
    cardInfo.appendChild(mediaWrapper);
    cardInfo.appendChild(textContent);

    // Append cardInfo to slide
    card.appendChild(cardInfo);

    // Append slide to container
    container.appendChild(card);
  });
}

function createDots(totalCards, maxAllowedCards, dots) {
  const numberOfDotsToBeCreated = numberOfDots(totalCards, maxAllowedCards);
  let index = 1;
  while (index <= numberOfDotsToBeCreated) {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.dataset.index = index;
    dot.setAttribute('aria-label', `dot-${index}`);
    dots.appendChild(dot);
    dot.addEventListener('click', (event) => {
      targetedDotView(event);
    });
    index += 1;
  }
  if (numberOfDotsToBeCreated > 0) {
    dots.firstElementChild.classList.add('active');
  }
}

async function createTabPanel(block) {
  const tabsPanel = block.querySelectorAll('.tabs-panel');

  for (let index = 0; index < tabsPanel.length; index += 1) {
    const tab = tabsPanel[index];
    const discoverMoreButton = tab.lastElementChild;
    tab.textContent = '';
    const tabId = tab.getAttribute('api-key');
    const title = document.createElement('div');
    title.className = 'title';
    const h2 = document.createElement('h2');
    const img = document.createElement('img');
    img.src = '/icons/video-icon.svg';
    img.alt = 'video-icon';
    const picture = document.createElement('picture');
    picture.appendChild(img);
    const textNode = document.createTextNode(tabId);
    h2.appendChild(picture);
    h2.appendChild(textNode);
    title.append(h2);
    tab.appendChild(title);
    const slider = document.createElement('div');
    slider.className = 'slider';
    tab.appendChild(slider);
    const track = document.createElement('div');
    track.className = 'track';
    const dots = document.createElement('div');
    dots.className = 'dots-container';
    slider.appendChild(track);
    slider.appendChild(dots);
    discoverMoreButton.className = 'discovermore';
    if (discoverMoreButton.firstElementChild && discoverMoreButton.firstElementChild.tagName === 'A') {
      discoverMoreButton.firstElementChild.className = 'discover-more-button';
    }
    tab.appendChild(discoverMoreButton);

    // Collect promises from asynchronous operations
    fetchData(`${getHostUrl()}/scripts/mock-${tabId}.json`, async (error, data = []) => {
      if (data) {
        createCards(track, data, tabId);
        createDots(data.length, allowedCardsCount(), dots);
      }
    });
  }
  intervalId = startCaraousal();
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  const types = [...block.children].map((child) => child.children[1]);

  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');
    tabpanel.setAttribute('api-key', types[i].textContent.toLowerCase());

    // build tab button
    const button = document.createElement('button');
    // copy all existing attributes of div into button
    Array.from(tab.attributes).forEach((singleAttribute) => {
      button.setAttribute(singleAttribute.name, singleAttribute.value);
    });
    button.className = 'tabs-tab';
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
      clearIntervalAndReset(intervalId);
      intervalId = startCaraousal();
    });
    tablist.append(button);
    tab.remove();
  });
  block.prepend(tablist);
  observe(block, createTabPanel);
}
