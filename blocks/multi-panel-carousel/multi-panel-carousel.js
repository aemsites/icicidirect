import { fetchPlaceholders, readBlockConfig } from '../../scripts/aem.js';
import {
  getResearchAPIUrl, getCurrentHost,
  readBlockMarkup, observe, postFormData,
  Viewport, fetchData, ICICI_FINOUX_HOST,
} from '../../scripts/blocks-utils.js';

const isDesktop = Viewport.isDesktop();

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

function setTrack(activeDot) {
  const dotIndex = parseInt(activeDot.dataset.index, 10);
  const carouselSlider = activeDot.closest('.carousel-slider');
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
}

function updateCarouselView(activeDot, scroll) {
  const dotIndex = parseInt(activeDot.dataset.index, 10);
  const carouselSlider = activeDot.closest('.carousel-slider');
  const dots = carouselSlider.querySelectorAll('.dot');
  setTrack(activeDot);
  const carouselTrack = carouselSlider.querySelector('.carousel-track');
  const cards = Array.from(carouselTrack.children);
  const moveDistance = dotIndex * cards[0].offsetWidth;
  if (Viewport.isMobile() && scroll) {
    carouselTrack.scrollTo({
      top: 0,
      left: carouselTrack.children[activeDot.dataset.index].offsetLeft,
      behavior: 'smooth',
    });
  } else {
    carouselTrack.style.transform = `translateX(-${moveDistance}px)`;
    dots.forEach((dot) => dot.classList.remove('active'));
    dots[dotIndex].classList.add('active');
  }
}

function setDotIndex(activeDot) {
  setTrack(activeDot);
  const dotIndex = parseInt(activeDot.dataset.index, 10);
  const carouselSlider = activeDot.closest('.carousel-slider');
  const dots = carouselSlider.querySelectorAll('.dot');
  if (!dots[dotIndex].classList.contains('active')) {
    dots.forEach((dot) => dot.classList.remove('active'));
    dots[dotIndex].classList.add('active');
  }
}

let intervalId;
function startUpdateCarousel(carouselSlider) {
  const dotsContainer = carouselSlider.querySelector('.dots-container');
  if (!dotsContainer) return; // Exit if dotsContainer doesn't exist

  const dots = dotsContainer.querySelectorAll('.dot');
  let activeDotIndex = Array.from(dots).findIndex((dot) => dot.classList.contains('active'));

  if (activeDotIndex === -1) {
    return;
  }

  let movingForward = true;
  intervalId = setInterval(() => {
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
    updateCarouselView(activeDot, Viewport.isMobile());
  }, 2000);
  carouselSlider.setAttribute('data-interval-id', intervalId);
}

function setCarouselView(type, carouselSlider) {
  const carouselTrack = carouselSlider.querySelector('.carousel-track');
  const cards = Array.from(carouselTrack.children);
  const visibleCards = allowedCardsCount();
  const numberOfDots = cards.length - visibleCards + 1;
  const isMobile = Viewport.isMobile();
  if (numberOfDots > 1) {
    let dotsContainer = document.querySelector('.dots-container');
    if (!dotsContainer) {
      dotsContainer = document.createElement('div');
      dotsContainer.className = 'dots-container border-box';
    } else {
      // If dotsContainer exists, clear its children
      while (dotsContainer.firstChild) {
        dotsContainer.removeChild(dotsContainer.firstChild);
      }
    }
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < numberOfDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot border-box';
      cards[i].dataset.index = i;
      dot.dataset.index = i;
      dot.setAttribute('aria-label', `dot-${i}`);
      dotsContainer.appendChild(dot);
      dot.addEventListener('click', (event) => {
        clearInterval(carouselSlider.getAttribute('data-interval-id'));
        updateCarouselView(event.currentTarget, Viewport.isMobile());
      });
    }

    carouselSlider.appendChild(dotsContainer);
    updateCarouselView(dotsContainer.firstChild, Viewport.isMobile());
    dotsContainer.firstElementChild.classList.add('active');
    if (isMobile) {
      carouselTrack.classList.add('scrollable');
      const slideObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const dots = entry.target.closest('.carousel-slider')
              .querySelector('.dots-container');
            const activeDot = dots.querySelector(`.dot[data-index='${entry.target.dataset.index}']`);
            setDotIndex(activeDot);
          });
        },
        { threshold: 0.8 },
      );
      cards.forEach((card) => {
        card.classList.add('scrollable');
        slideObserver.observe(card);
      });
    }
    startUpdateCarousel(carouselSlider);
  }
}

function updateRecommedations(selectedDropDownItem, type, marginActions) {
  const dropdown = selectedDropDownItem.closest('.dropdown-select');
  dropdown.querySelector('.dropdown-text').textContent = selectedDropDownItem.textContent;
  const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
  dropdownToggle.dataset.type = selectedDropDownItem.dataset.type;
  dropdownToggle.dataset.value = selectedDropDownItem.dataset.value;
  dropdown.querySelector('.dropdown-menu-container').classList.remove('visible');
  const block = dropdown.closest('.block');
  // eslint-disable-next-line no-use-before-define
  fetchCardsData(block, type, marginActions);
}

function closeAllDropDowns(clickedElement) {
  document.querySelectorAll('.dropdown-select').forEach((container) => {
    if (!container.contains(clickedElement)) {
      container.querySelector('.dropdown-menu-container').classList.remove('visible');
    }
  });
}

function createDropdown(menuItems, type, marginActions) {
  const dropdownText = menuItems[0].label;

  const dropdownSelectDiv = document.createElement('div');
  dropdownSelectDiv.className = 'dropdown-select border-box';

  const button = document.createElement('button');
  button.dataset.type = menuItems[0].type;
  button.dataset.value = menuItems[0].value;

  button.className = 'dropdown-toggle border-box';
  button.innerHTML = `<span class="dropdown-text">${dropdownText}</span><span class="icon-down-arrow icon"></span>`;

  const dropdownMenuContainer = document.createElement('div');
  dropdownMenuContainer.className = 'dropdown-menu-container border-box';

  const ul = document.createElement('ul');
  ul.className = 'dropdown-menu border-box';

  menuItems.forEach((item) => {
    const li = document.createElement('li');
    li.dataset.type = item.type;
    li.dataset.value = item.value;
    const a = document.createElement('a');
    const span = document.createElement('span');
    span.textContent = item.label;
    a.appendChild(span);
    li.appendChild(a);
    li.addEventListener('click', (event) => {
      updateRecommedations(event.currentTarget, type, marginActions);
    });
    ul.appendChild(li);
  });

  dropdownMenuContainer.appendChild(ul);
  dropdownSelectDiv.appendChild(button);
  dropdownSelectDiv.appendChild(dropdownMenuContainer);
  button.addEventListener('click', () => {
    dropdownMenuContainer.classList.toggle('visible');
  });

  return dropdownSelectDiv;
}

function createIconLink(iconWrap, src, alt) {
  const a = document.createElement('a');
  a.href = '#';
  a.tabIndex = 0;
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  a.appendChild(img);
  iconWrap.appendChild(a);
}

function companyCardHeader(company) {
  const headingWrap = document.createElement('div');
  headingWrap.className = 'heading-wrap border-box';

  const h4 = document.createElement('h4');
  h4.title = company.name;
  h4.textContent = company.name;
  headingWrap.appendChild(h4);

  const iconWrap = document.createElement('div');
  iconWrap.className = 'icon-wrap';

  createIconLink(iconWrap, '../../icons/icon-bookmark.svg', 'icon-bookmark');
  createIconLink(iconWrap, '../../icons/icon-share-2.svg', 'icon-share-2');

  headingWrap.appendChild(iconWrap);
  return headingWrap;
}

function addActionButton(boxFooter, company, type, marginActions) {
  const { action } = company;
  const btnWrap = document.createElement('div');
  if (type === 'trading') {
    btnWrap.className = 'btn-wrap border-box';
  }
  const aSell = document.createElement('a');
  aSell.href = marginActions[action.toLowerCase()];
  aSell.className = `btn border-box btn-${action.toLowerCase()}`;
  if (company.exit) {
    aSell.classList.add('disabled');
  }
  aSell.target = '_blank';
  aSell.tabIndex = 0;
  aSell.textContent = `${action}`;
  btnWrap.appendChild(aSell);
  boxFooter.appendChild(btnWrap);
}

function addFooterLabel(boxFooter, company, type, placeholders) {
  if (type !== 'trading' || company.RES_TIME_FRAME_ID !== 100) {
    return;
  }
  const footerLabel = document.createElement('div');
  footerLabel.className = 'footer-label border-box';
  const label = document.createElement('label');
  footerLabel.appendChild(label);
  const span = document.createElement('span');
  span.className = 'label-value';
  footerLabel.appendChild(span);

  if (company.Exit_Price && parseInt(company.Exit_Price, 10) > 0) {
    label.textContent = placeholders.profitexit;
    span.textContent = company.Exit_Price;
  } else if (company.Book_Profit_Price && parseInt(company.Book_Profit_Price, 10) > 0) {
    label.textContent = placeholders.bookprofit;
    span.textContent = company.Book_Profit_Price;
  } else {
    footerLabel.classList.add('disable');
  }

  boxFooter.appendChild(footerLabel);
}

function addReportLink(boxFooter, company) {
  if (company.reportLink) {
    const reportWrap = document.createElement('div');
    reportWrap.classList.add('border-box');
    const reportLink = document.createElement('a');
    reportLink.href = company.reportLink;
    reportLink.className = 'link-color';
    reportLink.target = '_blank';
    reportLink.textContent = 'View Report';
    reportWrap.appendChild(reportLink);
    boxFooter.appendChild(reportWrap);
  }
}

function createValueContent(row, labelText, valueText, colType = 'value') {
  const colDiv = document.createElement('div');
  const valueContentDiv = document.createElement('div');
  const label = document.createElement('label');
  const h5 = document.createElement('h5');

  colDiv.className = 'value-col col border-box';
  valueContentDiv.className = 'value-content border-box';
  if (colType !== 'value') {
    valueContentDiv.classList.add('field-content');
  }

  label.textContent = labelText;
  h5.className = 'label-value border-box';
  h5.innerHTML = valueText; // Using innerHTML to include <span> if necessary

  // Adding 'negative' or 'positive' class based on valueText for 'profit' and 'return'
  if (colType !== 'value' && valueText.toString().includes('-')) {
    h5.classList.add('negative');
  } else if (colType !== 'value') {
    h5.classList.add('positive');
  }

  if (colType === 'profit') { // Clearing existing children
    valueContentDiv.appendChild(h5);
    valueContentDiv.appendChild(label);
  } else {
    valueContentDiv.appendChild(label);
    valueContentDiv.appendChild(h5);
  }

  colDiv.appendChild(valueContentDiv);
  row.appendChild(colDiv);
}

function getRow(company, placeholders) {
  const rowDiv = document.createElement('div');
  rowDiv.className = 'row border-box';

  const contentData = [
    { label: placeholders.recoprice, value: company.recoPrice },
    { label: placeholders.profitpotential, value: company.profitPotential, type: 'profit' },
    { label: placeholders.buyingrange, value: company.buyingRange },
    { label: placeholders.returns, value: company.returns, type: 'return' },
    { label: placeholders.cmp, value: company.cmp ? `<span class="icon icon-rupee"></span>${company.cmp}` : '' },
    { label: placeholders.minamount, value: company.minAmount ? `<span class="icon icon-rupee"></span>${company.minAmount}` : '' },
    { label: placeholders.targetprice, value: company.targetPrice ? `<span class="icon icon-rupee"></span>${company.targetPrice}` : '' },
    { label: placeholders.riskprofile, value: company.riskProfile },
    { label: placeholders.stoploss, value: company.stopLoss ? `<span class="icon icon-rupee"></span>${company.stopLoss}` : '' },
  ];

  contentData.forEach((data) => {
    if (data.value) {
      createValueContent(rowDiv, data.label, data.value, data.type);
    }
  });

  return rowDiv;
}

function getRecommendationsCard(companies, type, placeholders, marginActions) {
  return companies.map((company) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'carousel-card border-box';
    const boxDiv = document.createElement('div');
    boxDiv.className = 'box border-box';
    if (type === 'trading') {
      boxDiv.classList.add('box-theme');
    }

    boxDiv.appendChild(companyCardHeader(company));

    const rowDiv = getRow(company, placeholders);
    boxDiv.appendChild(rowDiv);

    const boxFooter = document.createElement('div');
    boxFooter.className = 'box-footer border-box';
    if (type === 'trading') {
      boxFooter.classList.add('box-footer-theme');
    } else if (type === 'oneclickportfolio') {
      boxFooter.classList.add('one-div');
    }

    addReportLink(boxFooter, company);
    addActionButton(boxFooter, company, type, marginActions);
    addFooterLabel(boxFooter, company, type, placeholders);

    boxDiv.appendChild(boxFooter);

    cardDiv.appendChild(boxDiv);
    return cardDiv;
  });
}

function gerateReportLink(company) {
  const formattedCompanyName = company.COM_NAME.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-').toLowerCase();

  // Trim trailing .0 from RES_REPORT_ID
  const trimmedReportId = company.RES_REPORT_ID.toString().replace(/\.0$/, '');

  // Generate report link
  const reportLink = `${ICICI_FINOUX_HOST}/research/equity/${formattedCompanyName}/${trimmedReportId}`;

  return reportLink;
}

function updateCardsInView(block, type, recommendationArray, placeholders, marginActions) {
  const carouselSlider = block.querySelector('.carousel-slider');
  const carouselTrack = carouselSlider.querySelector('.carousel-track');
  const companiesArray = [];
  recommendationArray.forEach((company) => {
    const companyObj = {};

    if (type === 'oneclickportfolio') {
      companyObj.name = company.Pf_Name;
      companyObj.returns = !company.CAGR ? 'NA' : `${company.CAGR}%`;
      companyObj.minAmount = !company.Min_invest_value ? '0' : company.Min_invest_value;
      companyObj.riskProfile = !company.RISK_PROFILE ? 'low' : company.RISK_PROFILE;
      companyObj.action = 'Buy';
    } else {
      companyObj.name = company.COM_NAME;
      companyObj.targetPrice = !company.TARGET_PRICE ? 'NA' : company.TARGET_PRICE;
      companyObj.cmp = !company.CMP ? 'NA' : company.CMP;
      companyObj.stopLoss = !company.STOPLOSS_PRICE ? 'NA' : company.STOPLOSS_PRICE;
      companyObj.action = !company.RATING_TYPE_NM ? 'Buy' : company.RATING_TYPE_NM;

      if (type === 'trading') {
        companyObj.recoPrice = !company.RECOM_PRICE ? 'NA' : company.RECOM_PRICE;
      } else if (type === 'investing') {
        companyObj.profitPotential = !company.EXP_RETURN ? 'NA%' : `${company.EXP_RETURN}%`;
        // eslint-disable-next-line max-len
        companyObj.reportLink = gerateReportLink(company);
      }
    }

    companiesArray.push(companyObj);
  });
  if (companiesArray) {
    const recommendationsCard = getRecommendationsCard(
      companiesArray,
      type,
      placeholders,
      marginActions,
    );
    while (carouselTrack.firstChild) {
      carouselTrack.removeChild(carouselTrack.firstChild);
    }
    recommendationsCard.forEach((div) => {
      carouselTrack.appendChild(div);
    });
    setCarouselView(type, carouselSlider);
  }
}

async function fetchCardsData(block, type, marginActions) {
  const toggleBtn = block.querySelectorAll('.dropdown-toggle');
  let rating = '';
  let timeFrame = '';
  let option = 'BestPerforming';
  let jsonFormData;
  toggleBtn.forEach((btn) => {
    if (btn.dataset.type === 'rating') {
      rating = btn.dataset.value;
    } else if (btn.dataset.type === 'timeFrame') {
      timeFrame = btn.dataset.value;
    } else if (btn.dataset.type === 'option') {
      option = btn.dataset.value;
    }
  });
  if (type === 'trading') {
    if (timeFrame === 'intraday') {
      jsonFormData = {
        apiName: 'GetTradingIdeasIntraday',
      };
    } else {
      jsonFormData = {
        apiName: 'GetTradingIdeas',
        inputJson: JSON.stringify({
          rating, timeFrame, pageNo: 1, pageSize: 5,
        }),
      };
    }
  } else if (type === 'oneclickportfolio') {
    jsonFormData = {
      apiName: 'GetOneClickPortfolio',
      inputJson: JSON.stringify({ option }),
    };
  } else if (type === 'investing') {
    jsonFormData = {
      apiName: 'GetInvestingIdeas',
      inputJson: JSON.stringify({
        rating, timeFrame, pageNo: 1, pageSize: 5,
      }),
    };
  }

  const placeholders = await fetchPlaceholders();
  postFormData(getResearchAPIUrl(), jsonFormData, (error, tradingData = []) => {
    if (error === null && tradingData.Data) {
      let resultData;
      if (type === 'oneclickportfolio') {
        resultData = JSON.parse(tradingData.Data).Success.slice(0, 5);
      } else {
        resultData = tradingData.Data.Table;
      }
      updateCardsInView(block, type, resultData, placeholders, marginActions);
    }
  });
}
async function addingDynamicDropDowns(block, type, restructuredData, marginActions) {
  const dropdownsDiv = block.querySelector('.dropdowns');
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const dropdownType in restructuredData) {
    const items = restructuredData[dropdownType];
    const dropDownEle = createDropdown(items, type, marginActions);
    dropdownsDiv.appendChild(dropDownEle);
    document.addEventListener('click', (event) => {
      closeAllDropDowns(event.target);
    });
  }
}
async function generateDropDowns(block, type, marginActions) {
  // const restructuredData = {};
  if (type === 'investing') {
    const investingDropDowns = [
      { dropdownType: 'rating', apiName: 'GetRatings' },
      { dropdownType: 'timeFrame', apiName: 'GetTimeFrames' },
    ];
    investingDropDowns.forEach((dropDownDetails) => {
      const jsonFormData = {
        apiName: dropDownDetails.apiName,
        inputJson: JSON.stringify({ researchType: 1 }),
      };
      postFormData(getResearchAPIUrl(), jsonFormData, (error, DDData = []) => {
        const restructuredData = {};
        restructuredData[dropDownDetails.dropdownType] = [{ type: dropDownDetails.dropdownType, label: 'All', value: '' }];
        if (error === null && DDData.Data && DDData.Data.Table) {
          let count = 0;
          DDData.Data.Table.forEach((dropDownOption) => {
            if (dropDownDetails.dropdownType === 'rating') {
              if (count >= 4) {
                return;
              }
              // eslint-disable-next-line max-len
              restructuredData[dropDownDetails.dropdownType].push({ type: dropDownDetails.dropdownType, label: dropDownOption.RATING_TYPE_NM, value: dropDownOption.RES_RATINGS_TYPE_ID });
            } else {
              // eslint-disable-next-line max-len
              restructuredData[dropDownDetails.dropdownType].push({ type: dropDownDetails.dropdownType, label: dropDownOption.TIME_FRAME_NM, value: dropDownOption.RES_TIME_FRAME_ID });
            }
            count += 1;
          });
        }
        addingDynamicDropDowns(block, type, restructuredData, marginActions);
      });
    });
  } else {
    fetchData(`${getCurrentHost()}/dropdowndetails.json?sheet=${type}`, async (error, DDData = []) => {
      const restructuredData = {};
      DDData.data.forEach((item) => {
        const { Type, Label, Value } = item;

        // Check if the Type key exists in restructuredData
        if (!(Type in restructuredData)) {
          restructuredData[Type] = []; // If not, create an empty array
        }
        restructuredData[Type].push({ type: Type, label: Label, value: Value });
      });
      addingDynamicDropDowns(block, type, restructuredData, marginActions);
    });
  }
}
async function generateDynamicContent(block, type, marginActions) {
  generateDropDowns(block, type, marginActions);
  fetchCardsData(block, type, marginActions);
}

function addHighLightSection(carouselSection, highLightDiv, highLightIcon, type) {
  if (highLightDiv) {
    const div = document.createElement('div');
    div.className = 'carousel-highlight';
    if (type !== 'trading') {
      div.classList.add('green-highlight');
    }
    const span = document.createElement('span');
    const p = document.createElement('p');
    p.innerHTML = highLightDiv.innerHTML;
    span.appendChild(p);
    if (highLightIcon) {
      div.appendChild(highLightIcon);
      div.appendChild(span);
      div.appendChild(highLightIcon.cloneNode(true));
    } else {
      div.appendChild(span);
    }
    carouselSection.appendChild(div);
  }
}

function addCarouselHeader(carouselContainer, title, dropdowns, type) {
  const carouselHeader = document.createElement('div');
  carouselHeader.className = 'carousel-header border-box';
  const rowDiv = document.createElement('div');
  rowDiv.className = 'row align-items-center border-box';
  const colDiv = document.createElement('div');
  colDiv.className = 'col carousel-title border-box';
  const heading = document.createElement('h3');
  heading.textContent = title;
  colDiv.appendChild(heading);

  rowDiv.appendChild(colDiv);
  const dropdownsDiv = document.createElement('div');
  dropdownsDiv.className = 'dropdowns col border-box';
  rowDiv.appendChild(dropdownsDiv);

  // eslint-disable-next-line no-restricted-syntax,guard-for-in
  for (const dropdownsKey in dropdowns) {
    const items = dropdowns[dropdownsKey];
    const dropDownEle = createDropdown(items, type);
    dropdownsDiv.appendChild(dropDownEle);
    document.addEventListener('click', (event) => {
      closeAllDropDowns(event.target);
    });
  }

  carouselHeader.appendChild(rowDiv);
  carouselContainer.appendChild(carouselHeader);
}

function addCarouselCards(carouselBody) {
  const carouselSlider = document.createElement('div');
  carouselSlider.className = 'carousel-slider border-box';

  const carouselList = document.createElement('div');
  carouselList.classList.add('carousel-list');
  carouselSlider.appendChild(carouselList);
  const carouselTrack = document.createElement('div');
  carouselTrack.classList.add('carousel-track');
  carouselList.appendChild(carouselTrack);
  carouselBody.appendChild(carouselSlider);
}

function addDiscoverLink(carouselBody, discoverLink) {
  if (discoverLink) {
    const div = document.createElement('div');
    div.className = 'text-center discover-more border-box';
    const anchor = document.createElement('a');
    anchor.href = discoverLink; // Set the href to your discoverLink variable
    anchor.className = 'link-color';
    anchor.target = '_blank'; // Ensures the link opens in a new tab
    anchor.textContent = 'Discover More '; // Add the text content
    const icon = document.createElement('i');
    icon.className = 'icon-up-arrow icon ';
    anchor.appendChild(icon);
    div.appendChild(anchor);
    carouselBody.appendChild(div);
  }
}

function restructureDropDown(inputArray) {
  const restructuredData = {};

  inputArray.forEach((str, index) => {
    const labels = str.split(', ');
    const type = `Type${index + 1}`;
    restructuredData[type] = labels.map((label) => ({ type, label, value: '' }));
  });

  return restructuredData;
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const blockMarkup = readBlockMarkup(block);
  const { type } = blockConfig;
  const { title } = blockConfig;
  const marginActions = {
    buy: blockConfig['buy-action'],
    sell: blockConfig['sell-action'],
  };
  const highlightDiv = blockMarkup.predication;
  const highlightIcon = blockMarkup.targeticon.querySelector('picture');
  const discoverLink = blockConfig.discoverlink;
  const dropdowns = Array.isArray(blockConfig.dropdowns)
    ? blockConfig.dropdowns : [blockConfig.dropdowns].filter(Boolean);
  const restructuredDropDown = restructureDropDown(dropdowns);
  block.textContent = '';
  block.classList.add('carousel-section');
  addHighLightSection(block, highlightDiv, highlightIcon, type);

  const carouselContainer = document.createElement('div');
  carouselContainer.className = 'carousel-container border-box';
  block.appendChild(carouselContainer);

  addCarouselHeader(carouselContainer, title, restructuredDropDown, type);

  const carouselBody = document.createElement('div');
  carouselBody.className = 'carousel-body border-box';
  carouselContainer.appendChild(carouselBody);

  addCarouselCards(carouselBody);
  addDiscoverLink(carouselBody, discoverLink);
  observe(block, generateDynamicContent, type, marginActions);
}
