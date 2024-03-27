import { getTrendingNews } from '../../scripts/mockapi.js';
import { Viewport, createPictureElement } from '../../scripts/blocks-utils.js';
import { decorateIcons, fetchPlaceholders, readBlockConfig } from '../../scripts/aem.js';

const placeholders = await fetchPlaceholders();

function createMarketCommentaryCard() {
  const mainDiv = document.createElement('div');
  mainDiv.className = 'card';

  const anchorElement = document.createElement('a');
  anchorElement.href = 'https://www.icicidirect.com/equity/market-news-list/e/nifty-holds-22k-despite-modest-losses,-banks-and-it-dip/1499137';
  anchorElement.target = '_blank';

  // Create div with class "inner"
  const innerDiv = document.createElement('div');
  innerDiv.className = 'content';

  // Create heading element
  const headingElement = document.createElement('h4');
  headingElement.textContent = 'Nifty holds 22K despite modest losses, banks & IT dip';

  // Create paragraph element with class "commentText"
  const paragraphElement = document.createElement('p');
  paragraphElement.className = 'description';
  paragraphElement.textContent = 'Market Commentary - End-Session';

  // Create div with class "poweredBy"
  const poweredByDiv = document.createElement('div');
  poweredByDiv.className = 'info';

  // Create paragraph elements with spans inside "poweredBy" div
  const poweredByParagraph1 = document.createElement('p');
  poweredByParagraph1.textContent = 'Powered by ';
  const poweredBySpan1 = document.createElement('span');
  poweredBySpan1.textContent = 'ICICI Securities';
  poweredByParagraph1.appendChild(poweredBySpan1);

  const poweredByParagraph2 = document.createElement('p');
  poweredByParagraph2.textContent = 'Published on ';
  const poweredBySpan2 = document.createElement('span');
  poweredBySpan2.textContent = '17 May 2022 12:31';
  poweredByParagraph2.appendChild(poweredBySpan2);

  // Append all elements together
  poweredByDiv.appendChild(poweredByParagraph1);
  poweredByDiv.appendChild(poweredByParagraph2);

  innerDiv.appendChild(headingElement);
  innerDiv.appendChild(paragraphElement);
  innerDiv.appendChild(poweredByDiv);

  anchorElement.appendChild(innerDiv);

  // Create div with class "circleRow"
  const circleRowDiv = document.createElement('div');
  circleRowDiv.className = 'footer-row';

  // Create span with class "popCircle" inside "circleRow" div
  const popCircleSpan = document.createElement('span');
  popCircleSpan.className = 'footer-circle';

  circleRowDiv.appendChild(popCircleSpan);

  // Create div with class "commentaryTime"
  const commentaryTimeDiv = document.createElement('div');
  commentaryTimeDiv.className = 'footer-time';
  commentaryTimeDiv.textContent = '05:26 PM';

  mainDiv.appendChild(anchorElement);
  mainDiv.appendChild(circleRowDiv);
  mainDiv.appendChild(commentaryTimeDiv);
  return mainDiv;
}

export default function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const newsData = getTrendingNews();
  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'row';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'title text-center';
  const h2 = document.createElement('h2');
  h2.textContent = placeholders.marketcommentary;
  titleWrap.appendChild(h2);
  container.appendChild(titleWrap);

  const body = document.createElement('div');
  body.className = 'market-commentary-container';
  body.appendChild(createMarketCommentaryCard());
  container.appendChild(body);
  block.appendChild(container);
}
