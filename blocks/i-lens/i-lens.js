import { createElement, fetchData, observe } from '../../scripts/blocks-utils.js';
import { getHostUrl } from '../../scripts/mockapi.js';
import { decorateIcons, readBlockConfig } from '../../scripts/aem.js';

function decorateTitle(blockCfg) {
  const { title } = blockCfg;
  const blockTitleDiv = createElement('div', 'title');
  const blockTitle = createElement('h2', '');
  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon icon-ilens';
  blockTitle.appendChild(iconSpan);
  const textNode = document.createTextNode(title);
  blockTitle.appendChild(textNode);
  blockTitleDiv.append(blockTitle);
  decorateIcons(blockTitleDiv);
  return blockTitleDiv;
}

function updateRecommedations(selectedDropDownItem) {
  const dropdown = selectedDropDownItem.closest('.dropdown-select');
  const dropdownContainer = selectedDropDownItem.closest('.dropdowns');
  dropdown.querySelector('.dropdown-text').textContent = selectedDropDownItem.textContent;
  dropdown.querySelector('.dropdown-menu-container').classList.remove('visible');
  if (dropdownContainer.children[0] === dropdown) {
    // eslint-disable-next-line no-use-before-define
    addSecondDropDown(dropdownContainer, selectedDropDownItem.textContent);
  }
}
function createDropdown(dropdownValue) {
  // console.log(dropdownValue);
  const menuItems = dropdownValue.split(', ');
  const dropdownText = menuItems[0];

  const dropdownSelectDiv = document.createElement('div');
  dropdownSelectDiv.className = 'dropdown-select';

  const button = document.createElement('button');
  button.className = 'dropdown-toggle';
  button.innerHTML = `<span class="dropdown-text">${dropdownText}</span><span class="icon-down-arrow icon"></span>`;

  const dropdownMenuContainer = document.createElement('div');
  dropdownMenuContainer.className = 'dropdown-menu-container';

  const ul = document.createElement('ul');
  ul.className = 'dropdown-menu';

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

function addStocksData(ilensBody, dropdown = 'default') {
  ilensBody.textContent = '';
  fetchData(`${getHostUrl()}/scripts/mock-ilensdata.json`, async (error, ilensData = []) => {
    const { tableData } = ilensData[dropdown].body;
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
        // eslint-disable-next-line max-len
        label.appendChild(document.createTextNode(ilensData[dropdown].body.tableColumns[index + 6].name));
        listItem.appendChild(label);

        // eslint-disable-next-line no-shadow
        const span = document.createElement('span');
        span.classList.add('value');
        if (revenue.toLocaleString().endsWith('%') && parseFloat(revenue) > 0) {
          span.classList.add('green');
        }
        span.textContent = revenue.toLocaleString();
        listItem.appendChild(span);

        list.appendChild(listItem);
      });
      box.appendChild(list);

      // Append the box to the document body or any other container
      ilensBody.appendChild(box);
    }
  });
}

function addSecondDropDown(dropdownsDiv, dropdownValue) {
  const ilensBody = dropdownsDiv.closest('.i-lens-container').querySelector('.i-lens-body');
  while (dropdownsDiv.children.length > 1) {
    dropdownsDiv.removeChild(dropdownsDiv.children[1]);
  }
  fetchData(`${getHostUrl()}/draft/anagarwa/ilensdropdown.json`, async (error, ilensDDData = []) => {
    const { data } = ilensDDData;
    data.forEach((item) => {
      // console.log(item);
      if (item.primary === dropdownValue) {
        const secondDropDownValue = JSON.parse(item.secondary).join(', ');
        const secondDropDown = createDropdown(secondDropDownValue);
        dropdownsDiv.appendChild(secondDropDown);
        addStocksData(ilensBody, dropdownValue.toLowerCase());
      }
    });
  });

  if (dropdownsDiv.children.length === 1) {
    addStocksData(ilensBody);
  }
}

function closeAllDropDowns(clickedElement, dropdownsDiv) {
  dropdownsDiv.querySelectorAll('.dropdown-select').forEach((container) => {
    if (!container.contains(clickedElement)) {
      container.querySelector('.dropdown-menu-container').classList.remove('visible');
    }
  });
}

function addHeader(ilensContainer, dropdowns) {
  const header = document.createElement('div');
  header.className = 'i-lens-header';
  const rowDiv = document.createElement('div');
  rowDiv.className = 'row align-items-center';

  if (dropdowns) {
    const dropdownsDiv = document.createElement('div');
    dropdownsDiv.className = 'dropdowns col';
    dropdowns.forEach((dropdownValue) => {
      const dropDownEle = createDropdown(dropdownValue);
      dropdownsDiv.appendChild(dropDownEle);
    });

    rowDiv.appendChild(dropdownsDiv);
    dropdownsDiv.addEventListener('click', (event) => {
      closeAllDropDowns(event.target, dropdownsDiv);
    });
  }

  header.appendChild(rowDiv);
  ilensContainer.appendChild(header);
}

function addDiscoverLink(ilensBody, discoverLink) {
  if (discoverLink) {
    const div = document.createElement('div');
    div.className = 'text-center discover-more';
    const anchor = document.createElement('a');
    anchor.href = discoverLink; // Set the href to your discoverLink variable
    anchor.className = 'link-color';
    anchor.target = '_blank'; // Ensures the link opens in a new tab
    anchor.textContent = 'Discover More '; // Add the text content
    const icon = document.createElement('i');
    icon.className = 'icon-up-arrow icon ';
    anchor.appendChild(icon);
    div.appendChild(anchor);
    ilensBody.appendChild(div);
  }
}
export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  block.textContent = '';
  const title = decorateTitle(blockConfig);
  block.appendChild(title);
  const { description } = blockConfig;
  if (description) {
    const desc = createElement('p', 'description');
    desc.textContent = description;
    block.appendChild(desc);
  }
  const dropdowns = Array.isArray(blockConfig.dropdowns)
    ? blockConfig.dropdowns : [blockConfig.dropdowns].filter(Boolean);
  const discoverLink = blockConfig.discoverlink;
  const ilensContainer = document.createElement('div');
  ilensContainer.className = 'i-lens-container';
  block.appendChild(ilensContainer);

  addHeader(ilensContainer, dropdowns);

  const ilensBody = document.createElement('div');
  ilensBody.className = 'i-lens-body';
  ilensContainer.appendChild(ilensBody);
  addDiscoverLink(block, discoverLink);
  observe(ilensBody, addStocksData);
}
