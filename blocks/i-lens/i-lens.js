import { createElement, fetchData } from '../../scripts/blocks-utils.js';
import { getHostUrl } from '../../scripts/mockapi.js';
import { readBlockConfig } from '../../scripts/aem.js';

function decorateTitle(blockCfg) {
  const { title } = blockCfg;
  const blockTitleDiv = createElement('div', 'title');
  const blockTitle = createElement('h2', '');
  blockTitle.textContent = title;
  blockTitleDiv.append(blockTitle);
  return blockTitleDiv;
}

function updateRecommedations(selectedDropDownItem) {
  const dropdown = selectedDropDownItem.closest('.dropdown-select');
  dropdown.querySelector('.dropdown-text').textContent = selectedDropDownItem.textContent;
  dropdown.querySelector('.dropdown-menu-container').classList.remove('visible');
}

function createDropdown(dropdownValue) {
  const menuItems = dropdownValue.split(', ');
  const dropdownText = menuItems[0];

  const dropdownSelectDiv = document.createElement('div');
  dropdownSelectDiv.className = 'dropdown-select border-box';

  const button = document.createElement('button');
  button.className = 'dropdown-toggle border-box';
  button.innerHTML = `<span class="dropdown-text">${dropdownText}</span><span class="icon-down-arrow icon"></span>`;

  const dropdownMenuContainer = document.createElement('div');
  dropdownMenuContainer.className = 'dropdown-menu-container border-box';

  const ul = document.createElement('ul');
  ul.className = 'dropdown-menu border-box';

  menuItems.forEach((itemText) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const span = document.createElement('span');
    span.textContent = itemText;
    a.appendChild(span);
    li.appendChild(a);
    li.addEventListener('click', (event) => {
      updateRecommedations(event.currentTarget);
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

function addCarouselHeader(carouselContainer, dropdowns) {
  const carouselHeader = document.createElement('div');
  carouselHeader.className = 'carousel-header';
  const rowDiv = document.createElement('div');
  rowDiv.className = 'row align-items-center';
  // const colDiv = document.createElement('div');
  // colDiv.className = 'col carousel-title';
  // const heading = document.createElement('h3');
  // heading.textContent = title;
  // colDiv.appendChild(heading);
  //
  // rowDiv.appendChild(colDiv);

  if (dropdowns) {
    const dropdownsDiv = document.createElement('div');
    dropdownsDiv.className = 'dropdowns col border-box';
    dropdowns.forEach((dropdownValue) => {
      const dropDownEle = createDropdown(dropdownValue);
      dropdownsDiv.appendChild(dropDownEle);
    });
    rowDiv.appendChild(dropdownsDiv);
    // document.addEventListener('click', (event) => {
    //   closeAllDropDowns(event.target);
    // });
  }

  carouselHeader.appendChild(rowDiv);
  carouselContainer.appendChild(carouselHeader);
}

// eslint-disable-next-line no-unused-vars
function addStocksData(carouselBody) {
  fetchData(`${getHostUrl()}/scripts/mock-ilensdata.json`, async (error, ilensData = []) => {
    const { tableData } = ilensData.body;
    // Sort the tableData based on the Operating Revenue Qtr (SR_Q) in descending order
    tableData.sort((a, b) => b[6] - a[6]);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 5; i++) {
      const [stockName, ...revenues] = tableData[i];

      const box = document.createElement('div');
      box.classList.add('box');

      const heading = document.createElement('h3');
      heading.textContent = stockName;
      box.appendChild(heading);

      const list = document.createElement('ul');
      revenues.slice(5, 14).forEach((revenue, index) => {
        const listItem = document.createElement('li');

        // eslint-disable-next-line no-shadow
        const label = document.createElement('label');
        label.appendChild(document.createTextNode(ilensData.body.tableColumns[index + 6].name));
        listItem.appendChild(label);

        // eslint-disable-next-line no-shadow
        const span = document.createElement('span');
        span.classList.add('value');
        span.textContent = revenue.toLocaleString();
        listItem.appendChild(span);

        list.appendChild(listItem);
      });
      box.appendChild(list);

      // Append the box to the document body or any other container
      carouselBody.appendChild(box);
    }
  });
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
export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  block.textContent = '';
  block.classList.add('carousel-section');
  const title = decorateTitle(blockConfig);
  block.appendChild(title);
  const dropdowns = Array.isArray(blockConfig.dropdowns)
    ? blockConfig.dropdowns : [blockConfig.dropdowns].filter(Boolean);
  const carouselContainer = document.createElement('div');
  const discoverLink = blockConfig.discoverlink;
  carouselContainer.className = 'carousel-container';
  block.appendChild(carouselContainer);

  addCarouselHeader(carouselContainer, dropdowns);

  const carouselBody = document.createElement('div');
  carouselBody.className = 'carousel-body';
  carouselContainer.appendChild(carouselBody);
  addStocksData(carouselBody);
  addDiscoverLink(block, discoverLink);
}
