import { getTrendingNews } from '../../scripts/mockapi.js';
import { Viewport, createPictureElement, observe } from '../../scripts/blocks-utils.js';
import { decorateIcons, fetchPlaceholders } from '../../scripts/aem.js';

const placeholders = await fetchPlaceholders();

function createDiscoverMore() {
  const discoverMore = document.createElement('div');
  discoverMore.className = 'discover-more text-right';

  const link = document.createElement('a');
  link.href = 'https://www.icicidirect.com/research/equity/trending-news';
  link.className = 'link-color';
  link.target = '_blank';
  link.textContent = placeholders.discovermore;
  const icon = document.createElement('i');
  icon.className = 'icon-up-arrow icon';
  link.appendChild(icon);
  discoverMore.appendChild(link);
  return discoverMore;
}

function createNewsCards(news) {
  const article = document.createElement('div');
  article.className = 'article';

  const mediaWrapper = document.createElement('div');
  mediaWrapper.className = 'picture-wrapper';

  const picture = createPictureElement(news.imgUrl, 'article-thumbnail', false);

  mediaWrapper.appendChild(picture);

  const textContent = document.createElement('div');
  textContent.className = 'article-text';

  const h3 = document.createElement('h3');
  h3.className = 'post-title';
  const a = document.createElement('a');
  a.href = news.link;
  a.target = '_blank';
  a.tabIndex = '0';
  a.textContent = news.title;
  h3.appendChild(a);
  textContent.appendChild(h3);

  const postMeta = document.createElement('div');
  postMeta.className = 'post-info';
  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon icon-icon-time';
  const abbr = document.createElement('abbr');
  abbr.textContent = `${news.date} `;
  const abbrSource = document.createElement('abbr');
  abbrSource.textContent = news.source;
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

export default function decorate(block) {
  const newsData = getTrendingNews();
  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'container';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'title text-center';
  const h2 = document.createElement('h2');
  h2.textContent = placeholders.trendingnews;
  titleWrap.appendChild(h2);
  container.appendChild(titleWrap);

  const newsSection = document.createElement('div');
  newsSection.className = 'news-section';

  const slider = document.createElement('div');
  slider.className = 'news-slider';

  const newsTrack = document.createElement('div');
  newsTrack.className = 'news-track';

  newsData.forEach((news) => {
    const slide = document.createElement('div');
    slide.className = 'news-card';
    const article = createNewsCards(news);
    slide.appendChild(article);
    newsTrack.appendChild(slide);
  });

  slider.appendChild(newsTrack);
  newsSection.appendChild(slider);
  newsSection.appendChild(createDiscoverMore());
  container.appendChild(newsSection);

  block.appendChild(container);
  observe(block, createNewsCards);
}

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

let currentIndex = 0;
let shift = 0;
const intervalId = setInterval(() => {
  const cards = document.getElementsByClassName('news-track')[0].children;
  const cardSize = document.getElementsByClassName('news-card')[0].offsetWidth;
  const offset = allowedCardsCount();

  if (offset >= 4) {
    document.getElementsByClassName('news-track')[0].style.transform = 'translateX(0px)';
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
  document.getElementsByClassName('news-track')[0].style.transform = `translateX(-${moveDistance}px)`;
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
