import {
  buildBlock, decorateBlock, loadBlock, readBlockConfig,
} from '../../scripts/aem.js';
import {
  createElement, observe, getResearchAPIUrl, getDataFromAPI,
} from '../../scripts/blocks-utils.js';

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
  if (dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} | ${hour}:${minute}`;
  }
  return '';
}

function formatPriceInRupees(price) {
  if (price === null || price === '') {
    return '';
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

  const ratingDiv = decorateDataInBox('Rating', rating, 'ratings-div');
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

function renderRecentReportsCards(recentReportsDataArray, carouselItems, blockCfg, maxLimit = 20) {
  let slideCount = 0;
  const { buttontitle } = blockCfg;
  recentReportsDataArray.Data.Table.slice(0, 6).forEach((item) => {
    if (slideCount >= maxLimit) return;
    const slide = document.createElement('li');
    slide.classList.add('carousel-slide');

    const reportBox = createReportBox(
      item.COM_NAME,
      formatPriceInRupees(item.TARGET_PRICE),
      item.RATING,
      formatDate(item.REP_RELEASE_DTM),
      item.REPORT_PDF_LINK,
      buttontitle,
    );
    slide.innerHTML = reportBox.innerHTML;
    carouselItems.append(slide);

    slideCount += 1;
  });
}

function createCarouselDiv(block) {
  const carouselBlock = buildBlock('carousel', '');
  const carouselBlockParent = document.createElement('div');
  carouselBlockParent.classList.add('carousel-wrapper');
  carouselBlockParent.appendChild(carouselBlock);
  block.appendChild(carouselBlockParent);
}

async function loadCarousel(block, carouselItems) {
  const carouselBlock = block.querySelector('.carousel');
  carouselBlock.style.opacity = 0;
  carouselBlock.dataset.visibleSlides = block.dataset.visibleSlides || '';
  carouselBlock.dataset.autoScroll = block.dataset.autoScroll || '';
  carouselBlock.dataset.autoScrollDelay = block.dataset.autoScrollDelay || '';
  carouselBlock.innerHTML = '';
  decorateBlock(carouselBlock);
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

  loadBlock(carouselBlock).then((recentreportblock) => {
    let totalSlidesDisplayed = 0;
    if (carouselItems.children.length >= carouselBlock.dataset.visibleSlides) {
      totalSlidesDisplayed = carouselBlock.dataset.visibleSlides;
      carouselBlock.style.setProperty('--displayed-slides', carouselBlock.dataset.visibleSlides);
    } else {
      totalSlidesDisplayed = carouselItems.children.length;
      carouselBlock.style.setProperty('--displayed-slides', carouselItems.children.length);
    }

    if (totalSlidesDisplayed > 1) {
      let maxWidth = 0;
      carouselBlock.querySelectorAll('.carousel-slide .box').forEach((slide) => {
        if (maxWidth < slide.offsetWidth) {
          maxWidth = slide.offsetWidth;
        }
      });

      const margin = (carouselBlock.parentElement.offsetWidth
        - (totalSlidesDisplayed * maxWidth)) / 2;
      carouselBlock.querySelector('.carousel-slides-container').style
        .setProperty('margin-inline', `${margin.toString()}px`);
    }
    recentreportblock.style.opacity = 1;
  });
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
    div.className = 'discover-more-link';
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
      createCarouselDiv(block);
      getDataFromAPI(getResearchAPIUrl(), apiName, async (error, recentReportsDataArray = []) => {
        if (recentReportsDataArray) {
          renderRecentReportsCards(
            recentReportsDataArray,
            carouselItems,
            blockCfg,
            block?.dataset?.maxLimit,
          );
          observe(block, loadCarousel, carouselItems);
        }
      });
    } else if (configName === 'title') {
      const titleElement = configNameElement.nextElementSibling;
      handleTitleConfig(titleElement, block);
    } else if (configName === 'discoverlink') {
      addDiscoverLink(configNameElement.nextElementSibling, block);
    } else if (configName === 'visible slides') {
      const visibleSlides = configNameElement.nextElementSibling.textContent.trim();

      block.dataset.visibleSlides = visibleSlides;
    } else if (configName === 'auto scroll') {
      const autoScroll = configNameElement.nextElementSibling.textContent.trim();
      block.dataset.autoScroll = autoScroll;
    } else if (configName === 'auto scroll delay') {
      const autoScrollDelay = configNameElement.nextElementSibling.textContent.trim();
      block.dataset.autoScrollDelay = autoScrollDelay;
    } else if (configName === 'max limit') {
      const maxLimit = configNameElement.nextElementSibling.textContent.trim();
      block.dataset.maxLimit = maxLimit;
    }
  });
}
