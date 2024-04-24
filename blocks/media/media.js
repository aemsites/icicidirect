import {
  createPictureElement,
  getDataFromAPI,
  getResearchAPIUrl, observe,
  parseResponse,
  Viewport,
  SITE_ROOT,
} from '../../scripts/blocks-utils.js';
import { handleSocialShareClick } from '../../scripts/social-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';

const ICICI_DIRECT_VIDEOS_THUMBNAIL = 'https://img.youtube.com/vi/{id}/mqdefault.jpg';

function getVideosShareLink(permLink) {
  return `${SITE_ROOT}/research/videos/${permLink}`;
}

function getPodcastsShareLink(permLink) {
  return `${SITE_ROOT}/research/podcasts/${permLink}`;
}

function getVideosThumbnail(id) {
  return ICICI_DIRECT_VIDEOS_THUMBNAIL.replace('{id}', id);
}

function getPodcastsThumbnail(image) {
  return `${SITE_ROOT}/images/${image}`;
}

function numberOfDots(totalCards, maxAllowedCards) {
  if (totalCards > maxAllowedCards) return totalCards - maxAllowedCards + 1;
  return 0;
}

function openUrl(event) {
  window.location.href = event.currentTarget.getAttribute('share-link');
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

function targetedDotView(event) {
  const targetDotIndex = event.currentTarget.dataset.index;
  const block = event.currentTarget.closest('.block.media');
  clearInterval(block.getAttribute('interval-id'));
  const track = block.querySelector('.track');
  const dotsContainer = block.querySelector('.dots-container');
  dotsContainer.querySelector('.active').classList.remove('active');
  event.currentTarget.classList.add('active');
  const cardSize = track.firstElementChild.offsetWidth;
  const moveDistance = (targetDotIndex - 1) * cardSize;
  track.style.transform = `translateX(-${moveDistance}px)`;
}

async function createPicture(imageUrl, mediaWrapper) {
  mediaWrapper.appendChild(createPictureElement(imageUrl, 'mqdefault', false));
}

function createMediaCards(container, data, apiKey, cardWidth) {
  data.forEach((item) => {
    // Create slide element
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.style.width = `${cardWidth}px`;

    // Create cardInfo element
    const cardInfo = document.createElement('div');
    cardInfo.classList.add('card-info', `${apiKey}-card`);

    // Create picture-wrapper element
    const mediaWrapper = document.createElement('div');
    mediaWrapper.classList.add('picture-wrapper');
    mediaWrapper.addEventListener('click', (event) => {
      openUrl(event);
    });

    // Create text-content element
    const textContent = document.createElement('div');
    textContent.classList.add('text-content');

    switch (apiKey.toLowerCase()) {
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

function startCarousel(block) {
  let nextIndex = 1;
  let direction = 1;
  const intervalId = setInterval(() => {
    const track = block.querySelector('.track');
    const trackWidth = track.offsetWidth;
    const dotsContainer = block.querySelector('.dots-container');
    const dotsArray = dotsContainer.children;
    const cardWidth = trackWidth / allowedCardsCount();
    const cards = Array.from(track.children);
    if (cardWidth > 0) {
      cards.forEach((card) => {
        card.style.width = `${cardWidth}px`;
      });
    }
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
  block.setAttribute('interval-id', intervalId);
  return intervalId;
}

async function createMediaPanel(block) {
  let cardWidth;
  const track = block.querySelector('.track');
  const dots = block.querySelector('.dots-container');
  if (track.offsetWidth) {
    cardWidth = track.offsetWidth / allowedCardsCount();
  }
  const apiKey = block.getAttribute('api-key').toLowerCase();
  /* eslint-disable no-loop-func */
  const callback = async (error, apiResponse = []) => {
    if (apiResponse) {
      const jsonResult = parseResponse(apiResponse);
      createMediaCards(track, jsonResult, apiKey, cardWidth);
      createMediaDots(jsonResult.length, allowedCardsCount(), dots);
    }
  };
  switch (apiKey) {
    case 'videos':
      getDataFromAPI(getResearchAPIUrl(), 'GetVideos', callback);
      break;
    case 'podcasts':
      getDataFromAPI(getResearchAPIUrl(), 'GetPodcasts', callback);
      break;
    default:
      break;
  }
  startCarousel(block);
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  block.setAttribute('api-key', blockConfig.type);
  const titleText = blockConfig.title.trim();
  const discoverMoreButton = block.querySelector('.button-container');
  block.textContent = '';
  const title = document.createElement('div');
  title.className = 'title';
  const h2 = document.createElement('h2');
  const img = document.createElement('img');
  img.src = '/icons/video-icon.svg';
  img.alt = 'video-icon';
  const picture = document.createElement('picture');
  picture.appendChild(img);
  const textNode = document.createTextNode(titleText);
  h2.appendChild(picture);
  h2.appendChild(textNode);
  title.append(h2);
  block.appendChild(title);
  const slider = document.createElement('div');
  slider.className = 'slider';
  block.appendChild(slider);
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
  block.appendChild(discoverMoreButton);
  observe(block, createMediaPanel);
}
