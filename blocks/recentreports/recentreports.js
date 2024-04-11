import {
  buildBlock, decorateBlock, loadBlock, readBlockConfig,
} from '../../scripts/aem.js';
import { createElement, observe, getResearchAPIUrl, getDataFromAPI } from '../../scripts/blocks-utils.js';

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

/**
 * Formats a date string into a human-readable format.
 * @param {string} dateString - The date string to be formatted.
 * @returns {string} The formatted date string.
 */
function formatDate(dateString) {
  if(dateString){
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} | ${hour}:${minute}`;
  }
  return "";
}

function formatPriceInRupees(price) {
  // Check for empty or null input
  if (price === null || price === "") {
      return "";
  }
  const numericPrice = Number(price);
  const formattedPrice = numericPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  // Remove the rupee sign
  return formattedPrice.slice(1);
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

  const targetPriceDiv = decorateDataInBox('Target Price', targetPrice, 'target-price-div');
  row.appendChild(targetPriceDiv);

  const ratingDiv = decorateDataInBox('Rating', rating, 'rating-div');
  row.appendChild(ratingDiv);

  const dateDiv = decorateDataInBox('Date', date, 'date-div');
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

function renderRecentReportsCards( recentReportsDataArray, carouselItems, blockCfg) {
  const { buttontitle } = blockCfg;
  recentReportsDataArray.Data.Table.forEach((item) => {
    const reportBox = createReportBox(
      item.COM_NAME,
      formatPriceInRupees(item.TARGET_PRICE),
      item.RATING,
      formatDate(item.REP_RELEASE_DTM),
      item.REPORT_PDF_LINK,
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
    div.className = 'discover-more';
    const anchor = document.createElement('a');
    anchor.href = discoverMoreAnchor.href;
    anchor.className = 'link-color';
    anchor.target = '_blank';
    anchor.textContent = discoverMoreAnchor.title;
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
      getDataFromAPI(getResearchAPIUrl(), 'GetResearchRecentReports', async (error, recentReportsDataArray = []) => {
        if (recentReportsDataArray) {
          renderRecentReportsCards(recentReportsDataArray, carouselItems, blockCfg);
          observe(block, loadCarousel, carouselItems);
        }
      });
    } else if (configName === 'title') {
      const titleElement = configNameElement.nextElementSibling;
      handleTitleConfig(titleElement, block);
    } else if (configName === 'discoverlink') {
      addDiscoverLink(configNameElement.nextElementSibling, block);
    }
  });
}
