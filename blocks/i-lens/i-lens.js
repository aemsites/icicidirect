import {
  createElement, fetchData, getResearchAPIUrl, observe, postFormData, getHostUrl,
  handleNoResults,
} from '../../scripts/blocks-utils.js';
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

function addStocksData(ilensContainer, key) {
  if (!key) {
    return;
  }

  const ilensBody = ilensContainer.querySelector('.i-lens-body');
  ilensBody.textContent = '';
  const apiName = 'GetiLensData';
  const jsonFormData = {
    apiName,
    inputJson: JSON.stringify({
      screenpk: key,
    }),
  };

  postFormData(getResearchAPIUrl(), jsonFormData, (error, ilensStocksData = []) => {
    if (error || !ilensStocksData || ilensStocksData.length === 0) {
      const element = ilensContainer.querySelector('.i-lens-body');
      handleNoResults(element);
      return;
    }
    const ilensRecommendations = JSON.parse(ilensStocksData.Data).body;
    const { tableData } = ilensRecommendations;
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
        const labelText = ilensRecommendations.tableColumns[index + 6].name;
        label.appendChild(document.createTextNode(labelText));
        listItem.appendChild(label);

        // eslint-disable-next-line no-shadow
        const span = document.createElement('span');
        span.classList.add('value');
        if (labelText.includes('%')) {
          if (parseFloat(revenue) > 0) {
            span.classList.add('green');
          } else {
            span.classList.add('red');
          }
          span.textContent = `${revenue.toLocaleString()}%`;
        } else {
          span.textContent = revenue.toLocaleString();
        }

        listItem.appendChild(span);

        list.appendChild(listItem);
      });
      box.appendChild(list);

      // Append the box to the document body or any other container
      ilensBody.appendChild(box);
    }
  });
}

function createDropdown(ilensContainer, menuItems, dropDownDetails = []) {
  const dropdownText = menuItems[0].text;

  const dropdownSelectDiv = document.createElement('div');
  dropdownSelectDiv.className = 'dropdown-select';

  const button = document.createElement('button');
  button.className = 'dropdown-toggle';
  button.innerHTML = `<span class="dropdown-text">${dropdownText}</span><span class="icon-down-arrow icon"></span>`;

  const dropdownMenuContainer = document.createElement('div');
  dropdownMenuContainer.className = 'dropdown-menu-container';

  const ul = document.createElement('ul');
  ul.className = 'dropdown-menu';

  menuItems.forEach((item) => {
    const li = document.createElement('li');
    if (item.value) {
      li.dataset.value = item.value;
    }
    const a = document.createElement('a');
    const span = document.createElement('span');
    span.textContent = item.text;
    a.appendChild(span);
    li.appendChild(a);
    li.addEventListener('click', (event) => {
      // eslint-disable-next-line no-use-before-define
      updateRecommedations(ilensContainer, event.currentTarget, dropDownDetails);
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

function addSecondDropDown(ilensContainer, dropdownValue, dropDownDetails = []) {
  const dropdownsDiv = ilensContainer.querySelector('.dropdowns');
  while (dropdownsDiv.children.length > 1) {
    dropdownsDiv.removeChild(dropdownsDiv.children[1]);
  }
  const secondaryValues = [];
  dropDownDetails.forEach((item) => {
    if (item.primary === dropdownValue) {
      secondaryValues.push({ text: item.secondary, value: item.value });
    }
  });
  const secondDropDown = createDropdown(ilensContainer, secondaryValues, dropDownDetails);
  dropdownsDiv.appendChild(secondDropDown);
  addStocksData(ilensContainer, secondDropDown.querySelector('li').dataset.value);
}

function updateRecommedations(ilensConatainer, selectedDropDownItem, dropDownDetails = []) {
  const dropdown = selectedDropDownItem.closest('.dropdown-select');
  const dropdownContainer = selectedDropDownItem.closest('.dropdowns');
  dropdown.querySelector('.dropdown-text').textContent = selectedDropDownItem.textContent;
  dropdown.querySelector('.dropdown-menu-container').classList.remove('visible');
  if (dropdownContainer.children[0] === dropdown) {
    addSecondDropDown(ilensConatainer, selectedDropDownItem.textContent, dropDownDetails);
  } else if (selectedDropDownItem.dataset.value) {
    addStocksData(ilensConatainer, selectedDropDownItem.dataset.value);
  }
}

function closeAllDropDowns(clickedElement) {
  document.querySelectorAll('.dropdown-select').forEach((container) => {
    if (!container.contains(clickedElement)) {
      container.querySelector('.dropdown-menu-container').classList.remove('visible');
    }
  });
}

function updateDropDownList(ilensContainer, dropDownData) {
  const rowDiv = ilensContainer.querySelector('.row');
  const dropDownDetails = [];
  const primaryDropDown = [];
  dropDownData.forEach((item) => {
    dropDownDetails.push(item);
    if (!primaryDropDown.some((obj) => obj.text === item.primary)) {
      primaryDropDown.push({ text: item.primary });
    }
  });

  if (primaryDropDown.length > 0) {
    const dropdownsDiv = document.createElement('div');
    dropdownsDiv.className = 'dropdowns col';
    const dropDownEle = createDropdown(ilensContainer, primaryDropDown, dropDownDetails);
    dropdownsDiv.appendChild(dropDownEle);
    rowDiv.appendChild(dropdownsDiv);
    document.addEventListener('click', (event) => {
      closeAllDropDowns(event.target);
    });
  }
  observe(ilensContainer, updateRecommedations, rowDiv.querySelector('li'), dropDownDetails);
}

function addDropDowns(ilensContainer) {
  fetchData(`${getHostUrl()}/ilensdropdown.json`, async (error, ilensDDData = []) => {
    updateDropDownList(ilensContainer, ilensDDData.data);
  });
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
  const discoverLink = blockConfig.discoverlink;
  const ilensContainer = document.createElement('div');
  ilensContainer.className = 'i-lens-container';
  block.appendChild(ilensContainer);

  const header = document.createElement('div');
  header.className = 'i-lens-header';
  const rowDiv = document.createElement('div');
  rowDiv.className = 'row align-items-center';

  header.appendChild(rowDiv);
  ilensContainer.appendChild(header);

  const ilensBody = document.createElement('div');
  ilensBody.className = 'i-lens-body';
  ilensContainer.appendChild(ilensBody);
  addDiscoverLink(block, discoverLink);
  addDropDowns(ilensContainer);
}
