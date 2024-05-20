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

function getNewsThumbnail(image) {
  return `${getOriginUrl()}/images/${image}`;
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

  const picture = createPictureElement(getNewsThumbnail(item.Image), 'article-thumbnail', false);

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
  abbrSource.textContent = placeholders.icicisecurities;
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

async function generateNewsCard(block) {
  const newsTrack = block.querySelector('.news-track');
  const formData = new FormData();
  let cardWidth;
  formData.append('apiName', 'GetTrendingNews');
  formData.append('inputJson', JSON.stringify({ pageNo: '1', pageSize: '4' }));
  if (newsTrack.offsetWidth) {
    cardWidth = newsTrack.offsetWidth / allowedCardsCount();
  }
  postFormData(getResearchAPIUrl(), formData, async (error, apiResponse = []) => {
    if (error || !apiResponse || apiResponse.length === 0) {
      const element = block.querySelector('.news-slider');
      handleNoResults(element);
    } else {
      const jsonResult = parseResponse(apiResponse);
      let index = 0;
      jsonResult.forEach((item) => {
        if (item.PermLink) {
          const slide = document.createElement('div');
          slide.className = 'news-card';
          const article = createNewsCards(item);
          slide.style.width = `${cardWidth}px`;
          slide.setAttribute('index', index);
          slide.appendChild(article);
          newsTrack.appendChild(slide);
          index += 1;
        }
      });
    }
  });
  let forward = true;
  setInterval(() => {
    const cardIndex = Math.round(newsTrack.scrollLeft / cardWidth);
    const nextCard = newsTrack.querySelector(`.news-card[index='${cardIndex + allowedCardsCount()}']`);
    if (cardIndex === 0) forward = true;
    if (nextCard && forward) {
      newsTrack.scrollLeft = cardWidth * (cardIndex + allowedCardsCount());
    } else {
      newsTrack.scrollLeft = cardWidth * (cardIndex - allowedCardsCount());
      forward = false;
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

  newsTrack.addEventListener('scroll', () => {
    const cardWidth = newsTrack.querySelector('.news-card').offsetWidth;
    const cardIndex = Math.round(newsTrack.scrollLeft / cardWidth);
    const nextCard = newsTrack.querySelector(`.news-card[index='${cardIndex}']`);
    newsTrack.querySelectorAll('.news-card').forEach((card) => {
      card.classList.remove('active');
    });
    nextCard.classList.add('active');
  });
  slider.appendChild(newsTrack);
  newsSection.appendChild(slider);
  newsSection.appendChild(createDiscoverMore(blockConfig.discovermorelink));
  container.appendChild(newsSection);
  block.appendChild(container);
  observe(block, generateNewsCard, placeholders);
}
