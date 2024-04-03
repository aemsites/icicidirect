import { observe, Viewport } from '../../scripts/blocks-utils.js';
import { fetchPlaceholders } from '../../scripts/aem.js';
import { callMockCommenrtaryAPI } from '../../scripts/mockapi.js';
import {
  div, a, h4, p, span,
} from '../../scripts/dom-builder.js';

function allowedCardsCount() {
  const deviceType = Viewport.getDeviceType();
  switch (deviceType) {
    case 'Desktop':
      return 4;
    case 'Tablet':
      return 2;
    default:
      return 1;
  }
}
function createMarketCommentaryCard(cardData, placeholders) {
  const {
    articleUrl, titleText, descriptionText, publicationTimeText, footerTimeText,
  } = cardData;
  const mainDiv = div(
    { class: 'card' },
    a(
      { href: articleUrl, target: '_blank' },
      div(
        { class: 'content' },
        h4(titleText),
        p({ class: 'description' }, descriptionText),
        div(
          { class: 'info' },
          p(
            span(`${placeholders.powerby}`),
          ),
          p(
            span(`${placeholders.publishedon} ${publicationTimeText}`),
          ),
        ),
      ),
    ),
    div(
      { class: 'footer-row' },
      span({ class: 'footer-circle' }),
    ),
    div({ class: 'footer-time' }, footerTimeText),
  );
  return mainDiv;
}

function updateCarouselView(activeDot) {
  const dotIndex = parseInt(activeDot.dataset.index, 10);
  const commentaryContainer = activeDot.closest('.market-commentary-container');
  const dots = commentaryContainer.querySelectorAll('.dot');
  const currentActiveDot = commentaryContainer.querySelector('.dot.active');
  if (currentActiveDot && currentActiveDot.dataset.index === activeDot.dataset.index) {
    return;
  }
  const commentaryTrack = commentaryContainer.querySelector('.market-commentary-track');
  const cards = Array.from(commentaryTrack.children);
  let moveDistance = dotIndex * cards[0].offsetWidth;
  if (Viewport.isDesktop() && dotIndex === dots.length - 1) {
    moveDistance -= ((cards[0].offsetWidth) * 0.9);
  }
  commentaryTrack.style.transform = `translateX(-${moveDistance}px)`;
  dots.forEach((dot) => dot.classList.remove('active'));
  dots[dotIndex].classList.add('active');
}

function updateDots(block) {
  const track = block.querySelector('.market-commentary-track');
  const dotsContainer = block.querySelector('.dots-container');
  const cards = track.querySelectorAll('.card');
  const dotsCont = cards.length - allowedCardsCount() + 1;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < dotsCont; i++) {
    const dot = document.createElement('button');
    if (i === 0) {
      dot.className = 'dot active';
    } else {
      dot.className = 'dot';
    }
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
    dot.addEventListener('click', (event) => {
      updateCarouselView(event.currentTarget);
    });
  }
}

// eslint-disable-next-line no-unused-vars
async function generateCardsView(block, placeholders) {
  console.log(placeholders);
  const blogsContainer = block.querySelector('.market-commentary-track');
  const blogsDataArray = await callMockCommenrtaryAPI();
  blogsDataArray.forEach((blogData) => {
    const card = createMarketCommentaryCard(blogData, placeholders);
    blogsContainer.appendChild(card);
  });
  updateDots(block);
}
export default async function decorate(block) {
  block.textContent = '';
  const placeholders = await fetchPlaceholders();
  const titleWrap = document.createElement('div');
  titleWrap.className = 'title text-center';
  const h2 = document.createElement('h2');
  h2.textContent = placeholders.marketcommentary;
  titleWrap.appendChild(h2);
  block.appendChild(titleWrap);

  const containerlist = document.createElement('div');
  containerlist.className = 'market-commentary-container';

  const containerTrack = document.createElement('div');
  containerTrack.className = 'market-commentary-track';

  containerlist.appendChild(containerTrack);

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'dots-container';
  containerlist.appendChild(dotsContainer);
  block.appendChild(containerlist);
  observe(block, generateCardsView, placeholders);
}
