import {
  createPictureElement,
  // eslint-disable-next-line no-unused-vars
  getDataFromAPI,
  // eslint-disable-next-line no-unused-vars
  getResearchAPIUrl, observe, Viewport,
} from '../../scripts/blocks-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';

function allowedCardsCount() {
  const deviceType = Viewport.getDeviceType();
  switch (deviceType) {
    case 'Desktop':
      return 4;
    case 'Tablet':
      return 3;
    default:
      return 1;
  }
}

function numberOfDots(block, totalCards, maxAllowedCards) {
  const trackWidth = block.querySelector('.track').offsetWidth;
  const cardWidth = block.querySelector('.slide-card').offsetWidth;
  if (trackWidth / cardWidth === 1) {
    block.querySelector('.track').style.justifyContent = 'unset';
    if (totalCards === 1) return 0;
    return totalCards;
  }
  if (totalCards > maxAllowedCards) return totalCards - maxAllowedCards + 1;
  return 0;
}

function updateTrack(event) {
  const targetDotIndex = event.currentTarget.dataset.index;
  const block = event.currentTarget.closest('.block.ipo');
  const track = block.querySelector('.track');
  block.querySelectorAll('.slide-card').forEach((card) => {
    card.classList.remove('show');
  });
  track.children[targetDotIndex].classList.add('show');
  track.scrollTo({
    top: 0,
    left: track.children[targetDotIndex].offsetLeft,
    behavior: 'smooth',
  });
}

function createIPOCards(track, data, knowMoreButton, cardWidth) {
  let cardIndex = 0;
  if (data.length < allowedCardsCount()) {
    track.style.justifyContent = 'center';
  }
  data.forEach((item) => {
    const card = document.createElement('div');
    card.classList.add('slide-card');
    card.style.width = `${cardWidth}px`;
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

    // Append the "Know More" button to the button wrapper div
    btnWrapDiv.appendChild(knowMoreButton.cloneNode(true));

    // Append all elements to the IPO details container div
    ipoDetailsDiv.appendChild(openingDate);
    ipoDetailsDiv.appendChild(closingDate);
    ipoDetailsDiv.appendChild(btnWrapDiv);

    // Append all elements to the IPO items container div
    ipoItemsDiv.appendChild(logoWrapDiv);
    ipoItemsDiv.appendChild(heading);
    ipoItemsDiv.appendChild(ipoDetailsDiv);
    card.appendChild(ipoItemsDiv);
    track.appendChild(card);
  });
}

function createIPODots(block, totalCards, maxAllowedCards, dots) {
  const numberOfDotsToBeCreated = numberOfDots(block, totalCards, maxAllowedCards);
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

async function createIPOPanel(block, knowMoreButton) {
  let cardWidth;
  const track = block.querySelector('.track');
  const dots = block.querySelector('.dots-container');
  if (track.offsetWidth) {
    cardWidth = track.offsetWidth / allowedCardsCount();
  }
  const callback = async (error, apiResponse = []) => {
    /*  if (apiResponse) {
      const result = [];
      const jsonObject = {};
      apiResponse.Data.LatestUpcomingIpo.forEach((item) => {
        jsonObject[item.Key] = item.Value;
      });
      result.push(jsonObject); */
    createIPOCards(track, apiResponse, knowMoreButton, cardWidth);
    createIPODots(block, apiResponse.length, allowedCardsCount(), dots);
    // }
  };
  getDataFromAPI(getResearchAPIUrl(), 'GetLatestIPO', callback);
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const titleText = blockConfig.title || 'IPO';
  const knowMoreButton = block.querySelector('.button-container a');
  knowMoreButton.className = 'discover-more';
  const title = document.createElement('div');
  title.classList.add('title');
  title.textContent = titleText;
  block.textContent = '';
  block.appendChild(title);
  const slider = document.createElement('div');
  slider.className = 'slider';
  block.appendChild(slider);
  const track = document.createElement('div');
  track.className = 'track';
  track.addEventListener('scroll', () => {
    const cardWidth = track.querySelector('.slide-card').offsetWidth;
    const cardIndex = Math.round(track.scrollLeft / cardWidth);
    const dots = block.querySelector('.dots-container');
    if (dots.children.length > 0) {
      dots.querySelector('.active').classList.remove('active');
      dots.querySelector(`.dot[data-index='${cardIndex}']`).classList.add('active');
    }
  });
  const dots = document.createElement('div');
  dots.className = 'dots-container';
  slider.appendChild(track);
  slider.appendChild(dots);
  observe(block, createIPOPanel, knowMoreButton);
}
