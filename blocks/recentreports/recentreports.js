import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchReports } from '../../scripts/mockapi.js';

// Function to create a single report box
function createReportBox(title, targetPrice, rating, date, reportLink, i) {
  const slideDiv = document.createElement('div');
    slideDiv.setAttribute('class', 'slide slick-slide slick-active');
    slideDiv.setAttribute('data-slick-index', i);
    slideDiv.setAttribute('aria-hidden', 'false');
    slideDiv.setAttribute('style', 'width: 318px; height: 267px;');
    slideDiv.setAttribute('tabindex', '0');
    slideDiv.setAttribute('role', 'tabpanel');
    slideDiv.setAttribute('id', 'slick-slide' + (70 + i));
    slideDiv.setAttribute('aria-describedby', 'slick-slide-control' + (70 + i));

  const box = document.createElement('div');
  slideDiv.appendChild(box);
  box.classList.add('box');

  const heading = document.createElement('h3');
  const anchor = document.createElement('a');
  anchor.href = reportLink;
  anchor.target = '_blank';
  anchor.tabIndex = 0;
  anchor.textContent = title;
  heading.appendChild(anchor);
  box.appendChild(heading);

  const row = document.createElement('div');
  row.classList.add('row');

  const targetPriceDiv = createValueContent('Target Price', targetPrice, 'col-sm-8', 'col-6');
  row.appendChild(targetPriceDiv);

  const ratingDiv = createValueContent('Rating', rating,'col-sm-4', 'col-6');
  
  row.appendChild(ratingDiv);

  const dateDiv = createValueContent('Date', date,'col-sm-12', 'col-12');
  row.appendChild(dateDiv);

  box.appendChild(row);

  const footer = document.createElement('div');
  footer.classList.add('box-footer');

  const reportBtn = document.createElement('a');
  reportBtn.href = reportLink;
  reportBtn.target = '_blank';
  reportBtn.classList.add('btn', 'btn-field-theme');
  reportBtn.tabIndex = 0;
  reportBtn.textContent = 'Gladiator Stocks';
  footer.appendChild(reportBtn);

  box.appendChild(footer);

  return slideDiv;
}

// Function to create a value content div
function createValueContent(label, value, rowClass, colClass) {
  const div = document.createElement('div');
  div.classList.add(rowClass);
  div.classList.add(colClass);

  const content = document.createElement('div');
  content.classList.add('value-content');

  const labelElem = document.createElement('label');
  labelElem.textContent = label;
  content.appendChild(labelElem);

  const valueElem = document.createElement('h5');
  if(value == 'Buy'){
    valueElem.classList.add('positive');
  }
  valueElem.classList.add('label_value');
  valueElem.textContent = value;
  content.appendChild(valueElem);

  div.appendChild(content);

  return div;
}



export default function decorate(block) {

  var section = document.createElement('section');

// Set attributes for the section element
  section.setAttribute('id', 'RecentReports');
  section.setAttribute('class', 'section shadow-bottom reports_wrapper');


  const container = document.createElement('div');
  container.classList.add('container');

  const titleWrap = document.createElement('div');
  titleWrap.classList.add('title_wrap', 'text-center');

  const title = document.createElement('h2');
  title.textContent = 'RECENT REPORTS';
  titleWrap.appendChild(title);
  container.appendChild(titleWrap);

  const slider = document.createElement('div');
  slider.classList.add('slider', 'reports-slider', 'slick-initialized', 'slick-slider', 'slick-dotted');

  var slickListDiv = document.createElement('div');
  slickListDiv.setAttribute('class', 'slick-list draggable');
  slider.appendChild(slickListDiv);

  var slickTrackDiv = document.createElement('div');
  slickTrackDiv.setAttribute('class', 'slick-track');
  slickTrackDiv.setAttribute('style', 'opacity: 1; width: 636px; transform: translate3d(0px, 0px, 0px);');
  slickListDiv.appendChild(slickTrackDiv);

fetchReports().then((companies) => {
  if (companies) {
    var counter = 0;
    companies.forEach(company => {
      const reportBox = createReportBox(company.title, company.targetPrice, company.rating, company.date, company.reportLink,counter);
      counter = counter+1;
      slickTrackDiv.appendChild(reportBox);
  });
  }
});

const slickdots = document.createElement('ul');
slickdots.classList.add('slick-dots');
slickdots.setAttribute('role', 'tablist');
slider.appendChild(slickdots);


  container.appendChild(slider);


  const linkWrapper = document.createElement('div');
  linkWrapper.classList.add('mt-3', 'text-md-right', 'text-center');

  const link = document.createElement('a');
  link.href = 'https://www.icicidirect.com/research/equity/investing-ideas';
  link.classList.add('link-color');
  link.target = '_blank';
  link.textContent = 'Discover More';
  const icon = document.createElement('i');
  icon.classList.add('icon-up-arrow', 'icon');
  link.appendChild(icon);

  linkWrapper.appendChild(link);
  container.appendChild(linkWrapper);

  section.appendChild(container);


  //block.classList.add('recentreports');
  block.append(section);
}



