import {
  getResearchAPIUrl, postFormData,
  Viewport, createPictureElement, observe, parseResponse, getOriginUrl,
  handleNoResults,
} from '../../scripts/blocks-utils.js';
import { decorateIcons, fetchPlaceholders, readBlockConfig } from '../../scripts/aem.js';

const placeholders = await fetchPlaceholders();
const ICICI_DIRECT_NEWS_HOST = 'https://www.icicidirect.com/research/equity/trending-news/';
const ICICI_NEWS_THUMBNAIL_ICICI_HOST = 'https://www.icicidirect.com/images/';

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

function getNewsShareLink(permLink) {
  return ICICI_DIRECT_NEWS_HOST + permLink;
}

function getNewsThumbnail(image, author) {
  if (author.toLowerCase() === 'icici securities') return ICICI_NEWS_THUMBNAIL_ICICI_HOST + image;
  if (author.toLowerCase() === 'finoux') return `${getOriginUrl()}/images/${image}`;
  return '';
}

function createDiscoverMore(discovermorelink) {
  const discoverMore = document.createElement('div');
  discoverMore.className = 'discover-more text-right';

  const link = document.createElement('a');
  link.href = discovermorelink;
  link.className = 'link-color';
  link.target = '_blank';
  link.textContent = placeholders.discovermore;
  const icon = document.createElement('i');
  icon.className = 'icon-up-arrow icon';
  link.appendChild(icon);
  discoverMore.appendChild(link);
  return discoverMore;
}

function createNewsCards(item) {
  const article = document.createElement('div');
  article.className = 'article';

  const mediaWrapper = document.createElement('div');
  mediaWrapper.className = 'picture-wrapper';

  const picture = createPictureElement(getNewsThumbnail(item.Image, item.Author), 'article-thumbnail', false);

  mediaWrapper.appendChild(picture);

  const textContent = document.createElement('div');
  textContent.className = 'article-text';

  const h3 = document.createElement('h3');
  h3.className = 'post-title';
  const a = document.createElement('a');
  a.href = getNewsShareLink(item.PermLink);
  a.target = '_blank';
  a.tabIndex = '0';
  a.textContent = item.Title;
  h3.appendChild(a);
  textContent.appendChild(h3);

  const postMeta = document.createElement('div');
  postMeta.className = 'post-info';
  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon icon-icon-time';
  const abbr = document.createElement('abbr');
  abbr.textContent = `${item.PublishedOn} `;
  const abbrSource = document.createElement('abbr');
  abbrSource.textContent = item.Author;
  postMeta.appendChild(iconSpan);
  postMeta.appendChild(abbr);
  postMeta.appendChild(abbrSource);
  decorateIcons(postMeta);
  textContent.appendChild(postMeta);

  const description = document.createElement('div');
  description.className = 'descriptn articleDesc';
  textContent.appendChild(description);

  article.appendChild(mediaWrapper);
  article.appendChild(textContent);

  return article;
}

function addCards(block, newsData) {
  const newsTrack = block.querySelector('.news-track');
  for (let i = 0; i < newsData.length; i += 1) {
    const item = newsData[i];
    if (item.PermLink) {
      const slide = document.createElement('div');
      slide.className = 'news-card';
      const article = createNewsCards(item);
      slide.appendChild(article);
      newsTrack.appendChild(slide);
    }
  }
}

async function generateNewsCard(block) {
  const newsTrack = block.querySelector('.news-track');
  const formData = new FormData();

  formData.append('apiName', 'GetTrendingNews');
  formData.append('inputJson', JSON.stringify({ pageNo: '1', pageSize: '4' }));
  postFormData(getResearchAPIUrl(), formData, async (error, apiResponse = []) => {
    if (error || !apiResponse || apiResponse.length === 0) {
      const element = block.querySelector('.news-slider');
      handleNoResults(element);
    } else {
      const jsonResult = parseResponse(apiResponse);
      observe(block, addCards, jsonResult, placeholders);
    }
  });
  let currentIndex = 0;
  let shift = 0;
  const intervalId = setInterval(() => {
    const cards = newsTrack.children;
    const firstCard = newsTrack.firstChild;
    const cardSize = firstCard ? firstCard.offsetWidth : 0;
    const offset = allowedCardsCount();
    const cardsArray = Array.from(cards);
    if (offset >= 4) {
      cardsArray.forEach(((card) => {
        card.style.opacity = 1;
      }));
      newsTrack.style.transform = 'translateX(0px)';
      clearInterval(intervalId);
    }

    if (currentIndex >= cards.length) currentIndex = 0;
    if ((shift === 0 || shift !== allowedCardsCount()) && !(shift < 0)) {
      currentIndex = 0;
      shift = allowedCardsCount();
    }
    if (currentIndex === cards.length - offset && shift > 0) {
      shift = -shift; // Change direction when reaching the end
    } else if (currentIndex === 0 && shift < 0) {
      shift = -shift; // Change direction when reaching the beginning
    }
    currentIndex += shift;
    const moveDistance = currentIndex * (cardSize);
    newsTrack.style.transform = `translateX(-${moveDistance}px)`;
    let index = 0;
    if (allowedCardsCount() < 4) {
      if (allowedCardsCount() === 2) {
        while (index < cards.length) {
          if (index === currentIndex) {
            cards[index].style.opacity = 1;
            cards[index + 1].style.opacity = 1;
          } else {
            cards[index].style.opacity = 0;
            cards[index + 1].style.opacity = 0;
          }
          index += 2;
        }
      } else {
        while (index < cards.length) {
          if (index === currentIndex) {
            cards[index].style.opacity = 1;
          } else {
            cards[index].style.opacity = 0;
          }
          index += 1;
        }
      }
    }
  }, 3000);
}

export default function decorate(block) {
  const blockConfig = readBlockConfig(block);
  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'container';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'title text-center';
  const h2 = document.createElement('h2');
  h2.textContent = blockConfig.title;
  titleWrap.appendChild(h2);
  container.appendChild(titleWrap);
  const newsSection = document.createElement('div');
  newsSection.className = 'news-section';

  const slider = document.createElement('div');
  slider.className = 'news-slider';

  const newsTrack = document.createElement('div');
  newsTrack.className = 'news-track';

  slider.appendChild(newsTrack);
  newsSection.appendChild(slider);
  newsSection.appendChild(createDiscoverMore(blockConfig.discovermorelink));
  container.appendChild(newsSection);
  block.appendChild(container);
  generateNewsCard(block);
  //observe(block, generateNewsCard, placeholders);
}
