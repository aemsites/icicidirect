// Map of API names and their respective endpoint URLs
import {
  buildBlock, decorateBlock, loadBlock, readBlockConfig,
} from '../../scripts/aem.js';
import { callAPI } from '../../scripts/mockapi.js';
import { createElement, observe } from '../../scripts/blocks-utils.js';

function decorateBoxHeader(title, reportLink) {
  const heading = createElement('h3', '');
  const anchor = createElement('a', '');
  anchor.href = reportLink;
  anchor.target = '_blank';
  anchor.tabIndex = 0;
  anchor.textContent = title;
  heading.appendChild(anchor);

  return heading;
}
function decorateDataInBox(label, value, rowClass) {
  const div = createElement('div', rowClass);

  const content = createElement('div', 'value-content');
  const labelElem = createElement('label', '');
  labelElem.textContent = label;
  content.appendChild(labelElem);

  const valueElem = createElement('h5', 'label-value');
  if (value === 'Buy') {
    valueElem.classList.add('positive');
  }
  valueElem.textContent = value;
  content.appendChild(valueElem);
  div.appendChild(content);
  return div;
}
function decorateBoxFooter(reportLink, buttontitle) {
  const footer = createElement('div', 'box-footer');
  const reportBtn = createElement('a', 'btn');
  reportBtn.href = reportLink;
  reportBtn.target = '_blank';
  reportBtn.tabIndex = 0;
  reportBtn.textContent = buttontitle;
  footer.appendChild(reportBtn);
  return footer;
}
function decorateBox(targetPrice, rating, date) {
  const row = createElement('div', 'row');

  const targetPriceDiv = decorateDataInBox('Target Price', targetPrice, 'col-sm-8');
  row.appendChild(targetPriceDiv);

  const ratingDiv = decorateDataInBox('Rating', rating, 'col-sm-4');
  row.appendChild(ratingDiv);

  const dateDiv = decorateDataInBox('Date', date, 'col-sm-12');
  row.appendChild(dateDiv);

  return row;
}

function createReportBox(title, targetPrice, rating, date, reportLink, buttontitle) {
  const slideDiv = createElement('div', 'carousel-card');
  const box = createElement('div', 'box');
  slideDiv.appendChild(box);
  const header = decorateBoxHeader(title, reportLink);
  box.appendChild(header);
  const rowDiv = decorateBox(targetPrice, rating, date, reportLink);
  box.appendChild(rowDiv);
  const footer = decorateBoxFooter(reportLink, buttontitle);
  box.appendChild(footer);

  return slideDiv;
}

function renderRecentReportsCards({ data }, carouselItems, blockCfg) {
  const { buttontitle } = blockCfg;
  data.forEach((item) => {
    const reportBox = createReportBox(
      item.title,
      item.targetPrice,
      item.rating,
      item.date,
      item.reportLink,
      buttontitle,
    );
    carouselItems.append(reportBox);
  });
}

async function loadCarousel(block, carouselItems) {
  const carouselBlock = buildBlock('carousel', '');
  carouselBlock.style.display = 'none';
  carouselBlock.innerHTML = '';
  block.classList.forEach((className) => {
    carouselBlock.classList.add(className);
  });

  Array.from(carouselItems.children).forEach((carouselItemElement) => {
    const divElement = document.createElement('div');
    Array.from(carouselItemElement.children).forEach((child) => {
      divElement.appendChild(child.cloneNode(true));
    });
    carouselBlock.appendChild(divElement);
  });

  const carouselBlockParent = document.createElement('div');
  carouselBlockParent.classList.add('carousel-wrapper');
  carouselBlockParent.appendChild(carouselBlock);
  block.insertBefore(carouselBlockParent, block.firstChild.nextSibling);
  decorateBlock(carouselBlock);

  // carouselBlock.querySelectorAll('.social-share').
  // forEach((anchor) => anchor.addEventListener('click', () => handleSocialShareClick(anchor)));
  return loadBlock(carouselBlock);
}

function handleTitleConfig(titleElement, container) {
  const titleText = titleElement.textContent.trim();
  const title = document.createElement('h2');
  title.textContent = titleText;

  const titleWrapper = document.createElement('div');
  titleWrapper.classList.add('title-wrapper');
  titleWrapper.appendChild(title);

  container.insertBefore(titleWrapper, container.firstChild);
}

export default async function decorate(block) {
  /*  block.style.display = 'none';
  const container = block.closest('.section .section-container');
  container.style.display = 'none'; */
  const configElementsArray = Array.from(block.children);

  configElementsArray.map(async (configElement) => {
    configElement.style.display = 'none';
    const configNameElement = configElement.querySelector('div');
    const configName = configNameElement.textContent.trim().toLowerCase();
    const blockCfg = readBlockConfig(block);
    if (configName === 'type') {
      const carouselItems = document.createElement('div');
      carouselItems.classList.add('carousel-items');
      const apiName = configNameElement.nextElementSibling.textContent.trim();
      callAPI(apiName)
        .then((data) => {
          if (block.classList.contains('recentreports')) {
            renderRecentReportsCards(data, carouselItems, blockCfg);
          }
          observe(block, loadCarousel, carouselItems);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error fetching data:', error);
        })
        .finally(() => {
          block.style.display = 'block';
        });
    } else if (configName === 'title') {
      const titleElement = configNameElement.nextElementSibling;
      handleTitleConfig(titleElement, block);
    } else if (configName === 'link') {
      const buttonWrapper = document.createElement('div');
      buttonWrapper.classList.add('button-wrapper');
      buttonWrapper.append(configNameElement.nextElementSibling);
      block.append(buttonWrapper);
    }
  });
}
