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
  // carouselBlock.style.display = 'none';
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
function addDiscoverLink(discoverMoreDiv, block) {
  const discoverMoreAnchor = discoverMoreDiv.querySelector('a');
  if (discoverMoreAnchor) {
    const div = document.createElement('div');
    div.className = 'text-center discover-more';
    const anchor = document.createElement('a');
    anchor.href = discoverMoreAnchor.href; // Set the href to your discoverLink variable
    anchor.className = 'link-color';
    anchor.target = '_blank'; // Ensures the link opens in a new tab
    anchor.textContent = discoverMoreAnchor.title; // Add the text content
    const icon = document.createElement('i');
    icon.className = 'icon-up-arrow icon ';
    anchor.appendChild(icon);
    div.appendChild(anchor);
    block.appendChild(div);
  }
}

export default async function decorate(block) {
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
    } else if (configName === 'discoverlink') {
      addDiscoverLink(configNameElement.nextElementSibling, block);
      // discoverMoreLink.style.display = 'inline-block';
    }
  });
}
