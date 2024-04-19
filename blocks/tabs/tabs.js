import { toClassName } from '../../scripts/aem.js';
import {
  Viewport, createPictureElement, observe, getDataFromAPI, getResearchAPIUrl,
  parseResponse,
} from '../../scripts/blocks-utils.js';
import { handleSocialShareClick } from '../../scripts/social-utils.js';

const ICICI_DIRECT_VIDEOS_HOST = 'https://www.icicidirect.com/research/videos/';
const ICICI_DIRECT_PODCASTS_HOST = 'https://www.icicidirect.com/research/podcasts/';
const ICICI_DIRECT_VIDEOS_THUMBNAIL = 'https://img.youtube.com/vi/{id}/mqdefault.jpg';
const ICICI_DIRECT_PODCASTS_THUMBNAIL_HOST = 'https://www.icicidirect.com/images/';

function getVideosShareLink(permLink) {
  return ICICI_DIRECT_VIDEOS_HOST + permLink;
}

function getPodcastsShareLink(permLink) {
  return ICICI_DIRECT_PODCASTS_HOST + permLink;
}

function getVideosThumbnail(id) {
  return ICICI_DIRECT_VIDEOS_THUMBNAIL.replace('{id}', id);
}

function getPodcastsThumbnail(image) {
  return ICICI_DIRECT_PODCASTS_THUMBNAIL_HOST + image;
}

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

function startCarousel(block) {
  let nextIndex = 1;
  let direction = 1;
  const intervalId = setInterval(() => {
    const tabPanel = block.querySelector('.block.media.tabs .tabs-panel[aria-hidden="false"]');
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
  const tabPanel = block.querySelector('.block.media.tabs .tabs-panel[aria-hidden="false"]');
  tabPanel.setAttribute('interval-id', intervalId);
  return intervalId;
}

function clearIntervalAndReset(block) {
  const tabPanel = block.querySelector('.block.media.tabs .tabs-panel[aria-hidden="true"]');
  clearInterval(tabPanel.getAttribute('interval-id'));
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

function targetedDotView(event) {
  const targetDotIndex = event.currentTarget.dataset.index;
  const tabPanel = event.currentTarget.closest('.block.media.tabs').querySelector('.tabs-panel[aria-hidden="false"]');
  clearInterval(tabPanel.getAttribute('interval-id'));
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

function createPostTitle(title, shareLink) {
  const postTitle = document.createElement('h3');
  postTitle.classList.add('card-title');
  const postLink = document.createElement('a');
  postLink.setAttribute('href', shareLink);
  postLink.setAttribute('target', '_blank');
  postLink.textContent = title;
  postTitle.appendChild(postLink);
  return postTitle;
}

function createSocialLinkElement(shareLink) {
  const socialLink = document.createElement('div');
  socialLink.classList.add('social-link');
  const socialAnchor = document.createElement('a');
  const socialIcon = document.createElement('i');
  socialIcon.classList.add('fa', 'fa-share', 'icon');
  socialAnchor.dataset.href = shareLink;
  socialAnchor.addEventListener('click', () => handleSocialShareClick(socialAnchor));
  socialAnchor.appendChild(socialIcon);
  socialLink.appendChild(socialAnchor);
  return socialLink;
}

async function createPicture(imageUrl, mediaWrapper) {
  mediaWrapper.appendChild(createPictureElement(imageUrl, 'mqdefault', false));
}

function createMediaCards(container, data, tabId, cardWidth) {
  data.forEach((item) => {
    // Create slide element
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.style.width = `${cardWidth}px`;

    // Create cardInfo element
    const cardInfo = document.createElement('div');
    cardInfo.classList.add('card-info', `${tabId}-card`);

    // Create picture-wrapper element
    const mediaWrapper = document.createElement('div');
    mediaWrapper.classList.add('picture-wrapper');
    mediaWrapper.addEventListener('click', (event) => {
      openUrl(event);
    });

    // Create text-content element
    const textContent = document.createElement('div');
    textContent.classList.add('text-content');

    switch (tabId.toLowerCase()) {
      case 'videos':
        textContent.appendChild(createCardMetaElement(item.PublishedOn, item.Author));
        textContent.appendChild(createPostTitle(item.Title, getVideosShareLink(item.PermLink)));
        textContent.appendChild(createSocialLinkElement(getVideosShareLink(item.PermLink)));
        mediaWrapper.setAttribute('share-link', getVideosShareLink(item.PermLink));
        createPicture(getVideosThumbnail(item.Link), mediaWrapper);
        break;
      case 'podcasts':
        textContent.appendChild(createCardMetaElement(item.PublishedOn, '10:00 Minutes'));
        textContent.appendChild(createPostTitle(item.Title, getPodcastsShareLink(item.PermLink)));
        textContent.appendChild(createSocialLinkElement(getPodcastsShareLink(item.PermLink)));
        mediaWrapper.setAttribute('share-link', getPodcastsShareLink(item.PermLink));
        createPicture(getPodcastsThumbnail(item.Image), mediaWrapper);
        break;
      default:
        break;
    }

    // Append picture-wrapper and text-content to cardInfo
    cardInfo.appendChild(mediaWrapper);
    cardInfo.appendChild(textContent);

    // Append cardInfo to slide
    card.appendChild(cardInfo);

    // Append slide to container
    container.appendChild(card);
  });
}

function createMediaDots(totalCards, maxAllowedCards, dots) {
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

async function createMediaTabPanel(block) {
  const tabsPanel = block.querySelectorAll('.block.media.tabs .tabs-panel');
  let cardWidth;

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

    if (track.offsetWidth) {
      cardWidth = track.offsetWidth / allowedCardsCount();
    }

    /* eslint-disable no-loop-func */
    const callback = async (error, apiResponse = []) => {
      if (apiResponse) {
        const jsonResult = parseResponse(apiResponse);
        createMediaCards(track, jsonResult, tabId, cardWidth);
        createMediaDots(jsonResult.length, allowedCardsCount(), dots);
      }
    };
    switch (tabId) {
      case 'videos':
        getDataFromAPI(getResearchAPIUrl(), 'GetVideos', callback);
        break;
      case 'podcasts':
        getDataFromAPI(getResearchAPIUrl(), 'GetPodcasts', callback);
        break;
      default:
        break;
    }
  }
  startCarousel(block);
}

function updateTrack(event) {
  const targetDotIndex = event.currentTarget.dataset.index;
  const tabPanel = event.currentTarget.closest('.block.ipo.tabs').querySelector('.tabs-panel[aria-hidden="false"]');
  const track = tabPanel.querySelector('.track');
  track.scrollTo({
    top: 0,
    left: track.children[targetDotIndex].offsetLeft,
    behavior: 'smooth',
  });
}

function setActiveDot(target) {
  const tabPanel = target.closest('.block.ipo.tabs').querySelector('.tabs-panel[aria-hidden="false"]');
  const index = parseInt(target.getAttribute('index'), 10);
  const dotsContainer = tabPanel.querySelector('.dots-container');
  if (!dotsContainer.querySelector(`.dot[data-index='${index}']`).classList.contains('active')) {
    dotsContainer.querySelector('.active')?.classList.remove('active');
    dotsContainer.querySelector(`.dot[data-index='${index}']`).classList.add('active');
  }
}

function createIPODots(block, apiKey, totalCards, maxAllowedCards, dots) {
  const numberOfDotsToBeCreated = numberOfDots(totalCards, maxAllowedCards);
  let index = 0;
  while (index < numberOfDotsToBeCreated) {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.dataset.index = index;
    dot.setAttribute('aria-label', `dot-${index}`);
    dots.appendChild(dot);
    dot.addEventListener('click', (event) => {
      updateTrack(event);
    });
    index += 1;
  }
  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        setActiveDot(entry.target);
      });
    },
    { threshold: 0.8 },
  );
  block.querySelectorAll(`.slide-card.${apiKey}`).forEach((card) => {
    slideObserver.observe(card);
  });
  if (numberOfDotsToBeCreated > 0) {
    dots.firstElementChild.classList.add('active');
  }
}

function createIPOCards(container, apiKey, data) {
  let cardIndex = 0;
  data.forEach((item) => {
    const card = document.createElement('div');
    card.classList.add('slide-card', apiKey);
    card.setAttribute('id', `slide-card-${apiKey}-slide-${cardIndex}`);
    card.setAttribute('index', cardIndex);
    cardIndex += 1;
    const ipoItemsDiv = document.createElement('div');
    ipoItemsDiv.classList.add('ipo-items');

    // Create the logo wrapper div
    const logoWrapDiv = document.createElement('div');
    logoWrapDiv.classList.add('logo-wrap');

    const logoImg = createPictureElement(item.IPOLogoImage, 'Logo', false);

    // Append the logo image to the logo wrapper div
    logoWrapDiv.appendChild(logoImg);

    // Create the heading element
    const heading = document.createElement('h3');
    heading.textContent = item.IpoFullName;

    const ipoDetailsDiv = document.createElement('div');
    ipoDetailsDiv.classList.add('ipo-details');

    // Create and append the opening date paragraph
    const openingDate = document.createElement('p');
    openingDate.classList.add('open-close-text');
    openingDate.innerHTML = `<strong>Opening Date</strong> ${item.IPOEventStartDate}`;

    // Create and append the closing date paragraph
    const closingDate = document.createElement('p');
    closingDate.classList.add('open-close-text');
    closingDate.innerHTML = `<strong>Closing Date</strong> ${item.IPOEventEndDate}`;

    const btnWrapDiv = document.createElement('div');
    btnWrapDiv.classList.add('btn-wrap');

    // Create the "Know More" button
    const knowMoreBtn = document.createElement('a');
    knowMoreBtn.setAttribute('href', 'https://www.icicidirect.com/ipo');
    knowMoreBtn.setAttribute('class', 'discover-more');
    knowMoreBtn.setAttribute('target', '_blank');
    knowMoreBtn.setAttribute('tabindex', '0');
    knowMoreBtn.textContent = 'KNOW MORE';

    // Append the "Know More" button to the button wrapper div
    btnWrapDiv.appendChild(knowMoreBtn);

    // Append all elements to the IPO details container div
    ipoDetailsDiv.appendChild(openingDate);
    ipoDetailsDiv.appendChild(closingDate);
    ipoDetailsDiv.appendChild(btnWrapDiv);

    // Append all elements to the IPO items container div
    ipoItemsDiv.appendChild(logoWrapDiv);
    ipoItemsDiv.appendChild(heading);
    ipoItemsDiv.appendChild(ipoDetailsDiv);
    card.appendChild(ipoItemsDiv);
    container.appendChild(card);
  });
}

async function createIPOTabPanel(block) {
  const tabsPanel = block.querySelectorAll('.block.ipo.tabs .tabs-panel');

  for (let index = 0; index < tabsPanel.length; index += 1) {
    const tab = tabsPanel[index];
    tab.textContent = '';
    const apiKey = tab.getAttribute('api-key');
    const slider = document.createElement('div');
    slider.className = 'slider';
    tab.appendChild(slider);
    const track = document.createElement('div');
    track.className = 'track';
    const dots = document.createElement('div');
    dots.className = 'dots-container';
    slider.appendChild(track);
    slider.appendChild(dots);

    const callback = async (error, apiResponse = []) => {
      if (apiResponse) {
        const result = [];
        const jsonObject = {};
        apiResponse.Data.LatestUpcomingIpo.forEach((item) => {
          jsonObject[item.Key] = item.Value;
        });
        result.push(jsonObject);
        createIPOCards(track, apiKey, result);
        createIPODots(block, apiKey, result.length, 1, dots);
      }
    };
    getDataFromAPI(getResearchAPIUrl(), 'GetLatestIPO', callback);
  }
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
      clearIntervalAndReset(block);
      startCarousel(block);
    });
    tablist.append(button);
    tab.remove();
  });
  block.prepend(tablist);

  if (block.classList.contains('ipo')) observe(block, createIPOTabPanel);
  else if (block.classList.contains('media')) observe(block, createMediaTabPanel);
}
