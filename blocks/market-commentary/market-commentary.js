import {
  getDataFromAPI, getResearchAPIUrl, handleNoResults, ICICI_FINOUX_HOST, observe,
  sanitizeCompanyName,
} from '../../scripts/blocks-utils.js';
import { readBlockConfig, fetchPlaceholders } from '../../scripts/aem.js';
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
  const formattedHeading = sanitizeCompanyName(cardData.HEADING);

  // Trim trailing .0 from NEWS_ID
  const trimmedNewsId = cardData.NEWS_ID.toString().replace(/\.0$/, '');

  // Generate news link
  const newsLink = `${ICICI_FINOUX_HOST}/equity/market-news-list/${sessionCode}/${formattedHeading}/${trimmedNewsId}`;

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

function updateTrack(event) {
  const targetDotIndex = event.currentTarget.dataset.index;
  const commentaryContainer = event.currentTarget.closest('.market-commentary-container');
  const track = commentaryContainer.querySelector('.market-commentary-track');
  const relativeOffsetLeft = track.children[targetDotIndex].offsetLeft - track.offsetLeft;
  track.scrollTo({
    top: 0,
    left: relativeOffsetLeft,
    behavior: 'smooth',
  });
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
      updateTrack(event);
    });
  }
}

async function generateCardsView(block, placeholders) {
  const blogsContainer = block.querySelector('.market-commentary-track');
  getDataFromAPI(getResearchAPIUrl(), 'GetResearchEquityMarketCommentary', (error, marketCommentaryData = []) => {
    if (!marketCommentaryData || !marketCommentaryData.Data || !marketCommentaryData.Data.Table) {
      const element = block.querySelector('.market-commentary-container');
      handleNoResults(element);
      return;
    }
    let index = 0;
    marketCommentaryData.Data.Table.forEach((cardData) => {
      const card = createMarketCommentaryCard(cardData, placeholders);
      blogsContainer.appendChild(card);
      card.setAttribute('index', index);
      index += 1;
    });
    updateDots(block);
  });
}
export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  block.textContent = '';
  const placeholders = await fetchPlaceholders();
  const titleWrap = document.createElement('div');
  titleWrap.className = 'title text-center';
  const h2 = document.createElement('h2');
  h2.textContent = blockConfig.title;
  titleWrap.appendChild(h2);
  block.appendChild(titleWrap);

  const containerlist = document.createElement('div');
  containerlist.className = 'market-commentary-container';

  const containerTrack = document.createElement('div');
  containerTrack.className = 'market-commentary-track';

  containerTrack.addEventListener('scroll', () => {
    const cardWidth = containerTrack.querySelector('.card').offsetWidth;
    const cardIndex = Math.round(containerTrack.scrollLeft / cardWidth);
    const dots = block.querySelector('.dots-container');
    if (dots.children.length > 0) {
      dots.querySelector('.active').classList.remove('active');
      if (containerTrack.scrollLeft + containerTrack.offsetWidth >= containerTrack.scrollWidth) {
        dots.querySelector(`.dot[data-index='${dots.children.length - 1}']`).classList.add('active');
      } else {
        dots.querySelector(`.dot[data-index='${cardIndex}']`).classList.add('active');
      }
    }
  });
  containerlist.appendChild(containerTrack);

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'dots-container';
  containerlist.appendChild(dotsContainer);
  block.appendChild(containerlist);
  observe(block, generateCardsView, placeholders);
}
