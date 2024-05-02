import {
  getDataFromAPI, getResearchAPIUrl, ICICI_FINOUX_HOST, observe, Viewport,
} from '../../scripts/blocks-utils.js';
import { fetchPlaceholders } from '../../scripts/aem.js';
import {
  div, a, h4, p, span,
} from '../../scripts/dom-builder.js';

function generateNewsLink(cardData) {
  // Determine session code based on SECTION_NAME
  let sessionCode;
  if (cardData.SECTION_NAME.includes('Pre-Session')) {
    sessionCode = 'p';
  } else if (cardData.SECTION_NAME.includes('Mid-Session')) {
    sessionCode = 'm';
  } else if (cardData.SECTION_NAME.includes('End-Session')) {
    sessionCode = 'e';
  } else {
    sessionCode = '';
  }

  // Format heading
  const formattedHeading = cardData.HEADING.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-').toLowerCase();

  // Trim trailing .0 from NEWS_ID
  const trimmedNewsId = cardData.NEWS_ID.toString().replace(/\.0$/, '');

  // Generate news link
  const newsLink = `https://${ICICI_FINOUX_HOST}/equity/market-news-list/${sessionCode}/${formattedHeading}/${trimmedNewsId}`;

  return newsLink;
}

function createMarketCommentaryCard(cardData, placeholders) {
  const {
    HEADING,
    SECTION_NAME,
    NEWS_DATE,
    NEWS_TIME,
  } = cardData;
  const articleUrl = generateNewsLink(cardData);
  const mainDiv = div(
    { class: 'card' },
    a(
      { href: articleUrl, target: '_blank' },
      div(
        { class: 'content' },
        h4(HEADING),
        p({ class: 'description' }, SECTION_NAME),
        div(
          { class: 'info' },
          p(
            span(`${placeholders.powerby}`),
          ),
          p(
            span(`${placeholders.publishedon} ${NEWS_DATE}`),
          ),
        ),
      ),
    ),
    div(
      { class: 'footer-row' },
      span({ class: 'footer-circle' }),
    ),
    div({ class: 'footer-time' }, NEWS_TIME),
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
  if (Viewport.getDeviceType() === 'Desktop' && dotIndex === dots.length - 1) {
    moveDistance -= ((cards[0].offsetWidth) * 0.9);
  }
  commentaryTrack.style.transform = `translateX(-${moveDistance}px)`;
  dots.forEach((dot) => dot.classList.remove('active'));
  dots[dotIndex].classList.add('active');
}

function countVisibleCards(track, cards) {
  const totalAvailableWidth = track.offsetWidth;
  let totalCardsWidth = 0;
  let count = 0;
  // eslint-disable-next-line consistent-return
  cards.forEach((card) => {
    totalCardsWidth += card.offsetWidth;
    if (totalCardsWidth <= (totalAvailableWidth + 1)) {
      count += 1;
    } else {
      return count;
    }
  });
  return count;
}

function updateDots(block) {
  const track = block.querySelector('.market-commentary-track');
  const dotsContainer = block.querySelector('.dots-container');
  const cards = track.querySelectorAll('.card');
  const dotsCont = cards.length - countVisibleCards(track, cards) + 1;
  if (dotsCont <= 1) {
    return;
  }
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < dotsCont; i++) {
    const dot = document.createElement('button');
    if (i === 0) {
      dot.className = 'dot active';
    } else {
      dot.className = 'dot';
    }
    dot.dataset.index = i;
    dot.setAttribute('aria-label', `dot-${i}`);
    dotsContainer.appendChild(dot);
    dot.addEventListener('click', (event) => {
      updateCarouselView(event.currentTarget);
    });
  }
}

async function generateCardsView(block, placeholders) {
  const blogsContainer = block.querySelector('.market-commentary-track');
  getDataFromAPI(getResearchAPIUrl(), 'GetResearchEquityMarketCommentary', (error, marketCommentaryData = []) => {
    if (!marketCommentaryData || !marketCommentaryData.Data || !marketCommentaryData.Data.Table) {
      return;
    }
    marketCommentaryData.Data.Table.forEach((cardData) => {
      const card = createMarketCommentaryCard(cardData, placeholders);
      blogsContainer.appendChild(card);
    });
    updateDots(block);
  });
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
