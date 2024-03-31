import { fetchReports } from '../../scripts/mockapi.js';
import { createElement } from '../../scripts/blocks-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';
const Viewport = (function initializeViewport() {
  let deviceType;

  const breakpoints = {
    mobile: window.matchMedia('(max-width: 47.99rem)'),
    tablet: window.matchMedia('(min-width: 48rem) and (max-width: 63.99rem)'),
    desktop: window.matchMedia('(min-width: 64rem)'),
  };

  function getDeviceType() {
    if (breakpoints.mobile.matches) {
      deviceType = 'Mobile';
    } else if (breakpoints.tablet.matches) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Desktop';
    }
    return deviceType;
  }

  function isDesktop() {
    return deviceType === 'Desktop';
  }

  function isMobile() {
    return deviceType === 'Mobile';
  }
  function isTablet() {
    return deviceType === 'Tablet';
  }
  return {
    getDeviceType,
    isDesktop,
    isMobile,
    isTablet,
  };
}());

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

function decorateDataInBox(label, value, rowClass, colClass) {
  const div = createElement('div', rowClass);
  div.classList.add(colClass);

  const content = createElement('div', 'value-content');
  const labelElem = createElement('label', '');
  labelElem.textContent = label;
  content.appendChild(labelElem);

  const valueElem = createElement('h5', '');
  if (value === 'Buy') {
    valueElem.classList.add('positive');
  }
  valueElem.classList.add('label-value');
  valueElem.textContent = value;
  content.appendChild(valueElem);
  div.appendChild(content);
  return div;
}

function decorateBox(targetPrice, rating, date) {
  const row = createElement('div', 'row');

  const targetPriceDiv = decorateDataInBox('Target Price', targetPrice, 'col-sm-8', 'col-6');
  row.appendChild(targetPriceDiv);

  const ratingDiv = decorateDataInBox('Rating', rating, 'col-sm-4', 'col-6');
  row.appendChild(ratingDiv);

  const dateDiv = decorateDataInBox('Date', date, 'col-sm-12', 'col-12');
  row.appendChild(dateDiv);

  return row;
}

// function addSlickEvent(slider) {
//   slider.slick({
//     dots: true,
//     arrows: false,
//     autoplay: true,
//     infinite: false,
//     adaptiveHeight: true,
//     slidesToShow: 4,
//     slidesToScroll: 1,
//     responsive: [{
//         breakpoint: 1024,
//         settings: {
//             slidesToShow: 3,
//             slidesToScroll: 1
//         }
//     }, {
//         breakpoint: 768,
//         settings: {
//             slidesToShow: 2,
//             slidesToScroll: 1
//         }
//     }, {
//         breakpoint: 576,
//         settings: {
//             slidesToShow: 1,
//             slidesToScroll: 1
//         }
//     }]
//   });
// }

// function adjustHeight(slider){
//   slider.on("load", function(e,a) {
//     a.$slides.css("height", a.$slideTrack.height() + "px")
//   });
// }
// function removeDots(slider) {
//   slider.on("load", function() {
//     if (slider.find(".slick-slide").length <= 4) {
//       slider.addClass("remove-dots");
//     }
//   });
// }
function createReportBox(title, targetPrice, rating, date, reportLink, i, buttontitle) {
  const slideDiv = document.createElement('div');
  slideDiv.setAttribute('class', 'carousel-card border-box');
  slideDiv.setAttribute('style', 'width: 318px; height: 267px;');
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

function decorateBoxes(blockCfg) {
  const slider = createElement('div', 'slider');
  slider.classList.add('reports-slider', 'slick-initialized', 'slick-slider', 'slick-dotted');

  const slickListDiv = createElement('div', 'slick-list');
  slickListDiv.classList.add('draggable');
  slider.appendChild(slickListDiv);
  // addSlickEvent(slider);
  // adjustHeight(slider);
  // removeDots(slider);
  const slickTrackDiv = createElement('div', 'slick-track');
  slickTrackDiv.setAttribute('style', 'opacity: 1; width: 636px; transform: translate3d(0px, 0px, 0px);');
  slickListDiv.appendChild(slickTrackDiv);

 const { buttontitle } = blockCfg;
  fetchReports().then((companies) => {
    if (companies) {
      let counter = 0;
      companies.forEach((company) => {
        const reportBox = createReportBox(
          company.title,
          company.targetPrice,
          company.rating,
          company.date,
          company.reportLink,
          counter,
          buttontitle,
        );
        counter += 1;
        slickTrackDiv.appendChild(reportBox);
      });
    }
  });
  return slider;
}

function updateCarouselView(activeDot) {
  const dotIndex = parseInt(activeDot.dataset.index, 10);
  const carouselSlider = activeDot.closest('.carousel-slider');
  const dots = carouselSlider.querySelectorAll('.dot');
  const currentActiveDot = carouselSlider.querySelector('.dot.active');
  if (currentActiveDot && currentActiveDot.dataset.index === activeDot.dataset.index) {
    return;
  }
  const carouselTrack = carouselSlider.querySelector('.carousel-track');
  const widthAvailable = carouselTrack.offsetWidth;
  const allowedCards = allowedCardsCount();
  const cardWidth = widthAvailable / allowedCards;
  const cards = Array.from(carouselTrack.children);
  cards.forEach((card, index) => {
    if (index >= dotIndex && index < dotIndex + allowedCards) {
      card.style.opacity = 1;
    } else {
      card.style.opacity = 0;
    }
    card.style.width = `${cardWidth}px`;
  });
  const moveDistance = dotIndex * cards[0].offsetWidth;
  carouselTrack.style.transform = `translateX(-${moveDistance}px)`;
  dots.forEach((dot) => dot.classList.remove('active'));
  dots[dotIndex].classList.add('active');
}

function startUpdateCarousel(carouselSlider) {
  const dotsContainer = carouselSlider.querySelector('.dots-container');
  if (!dotsContainer) return; // Exit if dotsContainer doesn't exist

  const dots = dotsContainer.querySelectorAll('.dot');
  let activeDotIndex = Array.from(dots).findIndex((dot) => dot.classList.contains('active'));

  if (activeDotIndex === -1) {
    return;
  }

  const isDesktop = Viewport.isDesktop();
  let movingForward = true;

  const intervalId = setInterval(() => {
    if (isDesktop) {
      if (activeDotIndex === dots.length - 1) {
        clearInterval(intervalId); // Stop if it's desktop and reaches the last dot
        return;
      }
      activeDotIndex = (activeDotIndex + 1) % dots.length; // Move to the next dot
    } else {
      if (activeDotIndex === 0) {
        movingForward = true; // Switch to moving forward
      } else if (activeDotIndex === dots.length - 1) {
        movingForward = false; // Switch to moving in reverse
      }
      activeDotIndex = movingForward ? (activeDotIndex + 1) % dots.length : activeDotIndex - 1;
      if (activeDotIndex < 0) {
        activeDotIndex = dots.length - 1;
      }
    }
    const activeDot = dots[activeDotIndex];
    updateCarouselView(activeDot);
  }, 2000);
}

function setCarouselView(carouselSlider) {
  const carouselTrack = carouselSlider.querySelector('.carousel-track');
  const cards = Array.from(carouselTrack.children);
  const visibleCards = allowedCardsCount();
  const numberOfDots = cards.length - visibleCards + 1;
  //const numberOfDots = 2;
  if (numberOfDots > 0) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'dots-container border-box';
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < numberOfDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot border-box';
      dot.dataset.index = i;
      dotsContainer.appendChild(dot);
      dot.addEventListener('click', (event) => {
        updateCarouselView(event.currentTarget);
      });
    }

    carouselSlider.appendChild(dotsContainer);
    updateCarouselView(dotsContainer.firstChild);
    startUpdateCarousel(carouselSlider);
  }
}

async function generateCardsView(block,blockCfg) {
  const carouselSlider = block.querySelector('.carousel-slider');
  const carouselTrack = carouselSlider.querySelector('.carousel-track');
  const { buttontitle } = blockCfg;
  fetchReports().then((companies) => {
    if (companies) {
      let counter = 0;
      companies.forEach((company) => {
        const reportBox = createReportBox(
          company.title,
          company.targetPrice,
          company.rating,
          company.date,
          company.reportLink,
          counter,
          buttontitle,
        );
        counter += 1;
        carouselTrack.appendChild(reportBox);
      });
      setCarouselView(carouselSlider);
    }
  });
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
function addCarouselCards(container) {
  const carouselSlider = document.createElement('div');
  carouselSlider.className = 'carousel-slider border-box';

  const carouselList = document.createElement('div');
  carouselList.classList.add('carousel-list');
  carouselSlider.appendChild(carouselList);
  const carouselTrack = document.createElement('div');
  carouselTrack.classList.add('carousel-track');
  //carouselTrack.setAttribute('style', 'opacity: 1; width: 636px; transform: translate3d(0px, 0px, 0px);');
  carouselList.appendChild(carouselTrack);
  container.appendChild(carouselSlider);
}

function decorateDiscoverMore(discoverMoreAnchor) {
  const discoverMoreDiv = createElement('div', 'mt-3');
  const link = createElement('a', 'link-color');
  link.href = discoverMoreAnchor.href;
  link.target = '_blank';
  link.textContent = discoverMoreAnchor.title;
  const icon = createElement('i', 'icon-up-arrow');
  link.appendChild(icon);
  discoverMoreDiv.appendChild(link);
  return discoverMoreDiv;
}

function decorateTitle(blockCfg) {
  const { title } = blockCfg;
  const blockTitleDiv = createElement('div', 'title-wrap');
  const blockTitle = createElement('h2', '');
  blockTitle.textContent = title;
  blockTitleDiv.appendChild(blockTitle);
  return blockTitleDiv;
}

export default async function decorate(block) {
  const blockCfg = readBlockConfig(block);
  const title = decorateTitle(blockCfg);
  const discoverMoreAnchor = block.querySelector('a');
  const discoverMoreLink = decorateDiscoverMore(discoverMoreAnchor);
  const container = createElement('div', 'container');
  container.appendChild(title);
  addCarouselCards(container);
  generateCardsView(container,blockCfg);
  container.appendChild(discoverMoreLink);
  block.textContent = '';
  block.append(container);
}
