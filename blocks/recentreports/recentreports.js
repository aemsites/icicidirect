import { fetchReports } from '../../scripts/mockapi.js';
import { createElement } from '../../scripts/blocks-utils.js';
import { readBlockConfig } from '../../scripts/aem.js';

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
  slideDiv.setAttribute('class', 'slide slick-slide slick-active');
  slideDiv.setAttribute('data-slick-index', i);
  slideDiv.setAttribute('aria-hidden', 'false');
  slideDiv.setAttribute('style', 'width: 318px; height: 267px;');
  slideDiv.setAttribute('tabindex', '0');
  slideDiv.setAttribute('role', 'tabpanel');
  slideDiv.setAttribute('id', `slick-slide${70 + i}`);
  //  slideDiv.setAttribute('aria-describedby', `slick-slide-control${70 + i}`);
  const box = createElement('div', 'box');
  slideDiv.appendChild(box);
  const header = decorateBoxHeader(title);
  box.appendChild(header, reportLink);
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
  const slider = decorateBoxes(blockCfg);
  const slickdots = createElement('ul', 'slick-dots');
  slickdots.setAttribute('role', 'tablist');
  slider.appendChild(slickdots);
  container.appendChild(slider);
  container.appendChild(discoverMoreLink);
  block.textContent = '';
  block.append(container);
}
