import {
  buildBlock, decorateBlock, loadBlock, readBlockConfig,
} from '../../scripts/aem.js';
import {
  createElement, observe, getResearchAPIUrl, getDataFromAPI, readBlockMarkup,
  Viewport, generateReportLink, sanitizeCompanyName, ICICI_FINOUX_HOST, handleNoResults,
} from '../../scripts/blocks-utils.js';

function generateTitleLink(company) {
  const formattedCompanyName = sanitizeCompanyName(company);

  // Generate  link
  const link = `https://${ICICI_FINOUX_HOST}/stocks/`
                      + `${formattedCompanyName}-share-price`;
  return link;
}

function decorateBoxHeader(title) {
  const heading = createElement('h3', '');
  const anchor = createElement('a', '');
  anchor.href = generateTitleLink(title);
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

function decorateBoxFooter(companyName, reportId, buttontitle) {
  const footer = createElement('div', 'box-footer');
  const reportBtn = createElement('a', 'btn');
  reportBtn.href = generateReportLink(companyName, reportId);
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

function createReportBox(title, targetPrice, rating, date, reportId, buttontitle) {
  const slideDiv = createElement('div', 'carousel-card');
  const box = createElement('div', 'box');
  slideDiv.appendChild(box);
  const header = decorateBoxHeader(title);
  box.appendChild(header);
  const rowDiv = decorateBox(targetPrice, rating, date);
  box.appendChild(rowDiv);
  const footer = decorateBoxFooter(title, reportId, buttontitle);
  box.appendChild(footer);

  return slideDiv;
}

function renderRecentReportsCards(
  recentReportsDataArray,
  carouselItems,
  buttontitle,
  maxLimit = 20,
) {
  let slideCount = 0;
  recentReportsDataArray.Data.Table.slice(0, 20).forEach((item) => {
    if (slideCount >= maxLimit) return;
    const slide = document.createElement('li');
    slide.classList.add('carousel-slide');

    const reportBox = createReportBox(
      item.COM_NAME,
      formatPriceInRupees(item.TARGET_PRICE),
      item.RATING,
      formatDate(item.REP_RELEASE_DTM),
      item.RES_REPORT_ID,
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

function handleTitleConfig(title, block) {
  const titleDiv = document.createElement('h2');
  titleDiv.textContent = title;
  const titleWrapper = document.createElement('div');
  titleWrapper.classList.add('title-wrapper');
  titleWrapper.appendChild(titleDiv);
  block.appendChild(titleWrapper);
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

function addCardsDiv(block, title) {
  const carouselItems = document.createElement('div');
  carouselItems.classList.add('carousel-items');
  getDataFromAPI(getResearchAPIUrl(), 'GetResearchRecentReports', async (error, recentReportsDataArray = []) => {
    if (error || recentReportsDataArray.length === 0) {
      const element = block.querySelector('.carousel-wrapper');
      handleNoResults(element);
    } else {
      renderRecentReportsCards(
        recentReportsDataArray,
        carouselItems,
        title,
        block?.dataset?.maxLimit,
      );
      observe(block, loadCarousel, carouselItems);
    }
  });
}

function setAutoScrollBasedOnViewport(autoscrollString) {
  let autoscroll = '-1';
  if (autoscrollString && autoscrollString.split(':').length === 3) {
    const autoScrollValues = autoscrollString.split(':');
    const [mobileAutoscroll, tabletAutoscroll, desktopAutoscroll] = autoScrollValues;
    if (Viewport.isMobile()) {
      autoscroll = mobileAutoscroll;
    } else if (Viewport.isTablet()) {
      autoscroll = tabletAutoscroll;
    } else {
      autoscroll = desktopAutoscroll;
    }
  } else if (Viewport.isDesktop()) autoscroll = '1';
  return autoscroll;
}

function setVisibleSlidesBasedOnViewport(visibleSlidesString) {
  let visibleSlides = '1';
  if (visibleSlidesString && visibleSlidesString.split(':').length === 3) {
    const visibleSlidesValues = visibleSlidesString.split(':');
    const [mobileVisibleSlides, tabletVisibleSlides, desktopVisibleSlides] = visibleSlidesValues;
    if (Viewport.isMobile()) {
      visibleSlides = mobileVisibleSlides;
    } else if (Viewport.isTablet()) {
      visibleSlides = tabletVisibleSlides;
    } else {
      visibleSlides = desktopVisibleSlides;
    }
  } else if (Viewport.isDesktop()) {
    visibleSlides = '4';
  } else if (Viewport.isTablet()) {
    visibleSlides = '2';
  }
  return visibleSlides;
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const blockMarkup = readBlockMarkup(block);
  block.textContent = '';
  const {
    title, visibleslides, autoscroll, autoscrolldelay, maxlimit, discoverlink,
    buttontitle, type,
  } = blockConfig;
  handleTitleConfig(title, block);
  block.dataset.autoScroll = setAutoScrollBasedOnViewport(autoscroll);
  block.dataset.visibleSlides = setVisibleSlidesBasedOnViewport(visibleslides);
  if (autoscrolldelay) {
    block.dataset.autoScrollDelay = autoscrolldelay;
  }
  if (maxlimit) {
    block.dataset.maxLimit = maxlimit;
  }
  if (type === 'recentreports') {
    createCarouselDiv(block);
    observe(block, addCardsDiv, buttontitle);
  } else {
    const section = block.closest('.section');
    section.style.visibility = 'hidden';
  }
  if (discoverlink) {
    addDiscoverLink(blockMarkup.discoverlink, block);
  }
}
