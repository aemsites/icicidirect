import {
  createPictureElement,
  getDataFromAPI,
  getResearchAPIUrl, observe,
  parseResponse,
  Viewport,
  SITE_ROOT, readBlockMarkup,
  handleNoResults,
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

function updateTrack(event) {
  const targetDotIndex = event.currentTarget.dataset.index;
  const block = event.currentTarget.closest('.block.media');
  const track = block.querySelector('.track');
  clearInterval(track.getAttribute('interval-id'));
  const relativeOffsetLeft = track.children[targetDotIndex].offsetLeft - track.offsetLeft;
  track.scrollTo({
    top: 0,
    left: relativeOffsetLeft,
    behavior: 'smooth',
  });
}

async function createPicture(imageUrl, mediaWrapper) {
  mediaWrapper.appendChild(createPictureElement(imageUrl, 'mqdefault', false));
}

function createMediaCards(container, data, apiKey, cardWidth) {
  let index = 0;
  data.forEach((item) => {
    // Create slide element
    const card = document.createElement('div');
    card.className = 'slide-card';
    card.style.width = `${cardWidth}px`;
    card.setAttribute('index', index);
    index += 1;

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

    ['mousedown', 'touchmove', 'wheel'].forEach((eventType) => {
      card.addEventListener(eventType, () => {
        clearInterval(container.getAttribute('interval-id'));
      });
    });

    // Append slide to container
    container.appendChild(card);
  });
}

function createMediaDots(totalCards, maxAllowedCards, dots) {
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
  if (numberOfDotsToBeCreated > 0) {
    dots.firstElementChild.classList.add('active');
  }
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
    if (error || !apiResponse) {
      const element = block.querySelector('.slider');
      handleNoResults(element);
    } else {
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
  const intervalId = setInterval(() => {
    const cardIndex = Math.round(track.scrollLeft / cardWidth);
    const nextCard = track.querySelector(`.slide-card[index='${cardIndex + 1}']`);
    if (nextCard) {
      track.scrollLeft = cardWidth * (cardIndex + 1);
    }
    if (cardIndex === track.children.length - allowedCardsCount()) {
      clearInterval(intervalId);
    }
  }, 4000);
  track.setAttribute('interval-id', intervalId);
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const blockMarkup = readBlockMarkup(block);
  block.setAttribute('api-key', blockConfig.type);
  const titleText = blockConfig.title.trim();
  const discoverMoreButton = blockMarkup.link;
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
  track.addEventListener('scroll', () => {
    const cardWidth = track.querySelector('.slide-card').offsetWidth;
    const cardIndex = Math.round(track.scrollLeft / cardWidth);
    const dots = block.querySelector('.dots-container');
    if (dots.children.length > 0) {
      dots.querySelector('.active').classList.remove('active');
      dots.querySelector(`.dot[data-index='${cardIndex}']`).classList.add('active');
    }
  });
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
