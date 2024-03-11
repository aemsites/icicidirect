import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Decorator for global navigation on top the page
 * @param {*} fragment nav page fragment referenced for decoration of the current page
 */
const decorateGlobalNavigationBar = (fragment, block) => {
  const globalNavigator = document.createElement('div');
  globalNavigator.className = 'global-navigator';
  const containerDiv = document.createElement('div');
  containerDiv.className = 'container';
  globalNavigator.append(containerDiv);
  const navigationItems = fragment.querySelectorAll('.section.global-navigator li');

  navigationItems.forEach((singleNavigation) => {
    const singleItemDiv = document.createElement('div');
    singleItemDiv.className = 'global-section-item';
    singleItemDiv.appendChild(singleNavigation.firstChild);
    containerDiv.appendChild(singleItemDiv);
  });
  block.append(globalNavigator);
};

/**
 * Build the main header logo section
 * @returns the logo wrapped in div tag
 */
const decorateMainHeaderLogo = (fragment) => {
  const logoDiv = document.createElement('div');
  logoDiv.className = 'logo';
  const headerLogoDetails = fragment.querySelector('.section.icici-logo');
  const imageAltData = headerLogoDetails.getAttribute('data-image-alt');
  const imageTag = headerLogoDetails.querySelector('img');
  imageTag.alt = imageAltData;
  logoDiv.appendChild(imageTag);
  return logoDiv;
};

/**
 * Build the hamburger icon for the side panel toggling
 * @returns the hamburger icon wrapped in div
 */
const buildHamburgerIcon = () => {
  const hamburgerIconDiv = document.createElement('div');
  hamburgerIconDiv.className = 'hamburger-menu';
  hamburgerIconDiv.id = 'hamburger-menu-icon';
  hamburgerIconDiv.innerHTML = `
    <div></div>
    <div></div>
    <div></div>
  `;
  return hamburgerIconDiv;
};

/**
 * Builds the top search bar section
 * @returns the search bar wrapped in div
 */
const decorateTopSearchBar = () => {
  const searchBarDiv = document.createElement('div');
  searchBarDiv.className = 'search-bar';
  const searchBarContainer = document.createElement('div');
  searchBarContainer.className = 'search-bar-container';

  const categoryPickerDiv = document.createElement('div');
  categoryPickerDiv.className = 'category-picker';
  categoryPickerDiv.innerHTML = `
    <div class="categories">All</div>
    <div class="dropdown">&#xe905;</div>
  `;
  const searchBoxDiv = document.createElement('div');
  searchBoxDiv.className = 'search-box';
  searchBoxDiv.innerHTML = `
    <div class="search-field">
      <form>
        <input type="text" id="global-search" name="global-search" placeholder="Search Stocks and Nav">
      </form>
    </div>
    <div>
      <img class="search-icon" src="../../icons/icon-search.svg" alt="Search">
    </div>
  `;
  searchBarContainer.appendChild(categoryPickerDiv);
  searchBarContainer.appendChild(searchBoxDiv);
  searchBarDiv.appendChild(searchBarContainer);
  return searchBarDiv;
};

/**
 * Builds the login button shown in the mobile view
 * @returns the login button wrapped in div
 */
const buildLoginButton = () => {
  const loginButton = document.createElement('button');
  loginButton.classList.add('round-button', 'mobile-element');
  loginButton.innerHTML = 'Login';
  return loginButton;
};

/**
 * Builds the mobile specific search icon
 * @returns the plain search icon wrapped in div
 */
const buildSearchIcon = () => {
  const searchImageIcon = document.createElement('img');
  searchImageIcon.classList.add('search-icon', 'mobile-element');
  searchImageIcon.src = '../../icons/icon-search.svg';
  searchImageIcon.alt = 'Search';
  return searchImageIcon;
};

/**
 * Returns the list of primary buttons
 * @returns the list of buttons;
 */
const getPrimaryButtonsList = (fragment) => {
  const primaryButtonsList = [];
  const primaryButtonItems = fragment.querySelectorAll('.section.primary-buttons li');
  primaryButtonItems.forEach((singleItem, index) => {
    const buttonName = singleItem.innerText;
    const buttonLinkNode = singleItem.querySelector('a');
    const url = buttonLinkNode?.getAttribute('href');
    const linkTag = document.createElement('a');
    linkTag.href = url || '';
    const singleButton = document.createElement('button');
    singleButton.innerText = buttonName;
    singleButton.classList.add('round-button');
    if (index === 0) {
      singleButton.classList.add('gradient-orange');
    } else {
      singleButton.classList.add('desktop-element');
    }
    linkTag.appendChild(singleButton);
    primaryButtonsList.push(linkTag);
  });
  return primaryButtonsList;
};

/**
 * Decorate the top bar with logo, search section and primary action button
 * @param {*} fragment nav page fragment
 */
const decorateTopBarPanel = (fragment, block) => {
  const topBarSection = document.createElement('div');
  topBarSection.className = 'top-bar';
  const topBarContainerDiv = document.createElement('div');
  topBarContainerDiv.className = 'container';
  topBarContainerDiv.id = 'top-bar';
  topBarSection.append(topBarContainerDiv);
  const row1Div = document.createElement('div');
  row1Div.className = 'row1';
  topBarContainerDiv.appendChild(row1Div);

  // Hamburger logo creation
  const hamburgerIconDiv = buildHamburgerIcon();
  // Main ICICI Logo decoration
  const logoDiv = decorateMainHeaderLogo(fragment);
  // Build the search bar section
  const searchBarDiv = decorateTopSearchBar();
  // Add mobile specific login button
  const loginButton = buildLoginButton();
  // Add mobile specific search icon
  const searchImageIcon = buildSearchIcon();
  // Build Top Bar Primary action section
  const primaryButtonsDiv = document.createElement('div');
  primaryButtonsDiv.className = 'primary-buttons';
  primaryButtonsDiv.appendChild(searchBarDiv);
  primaryButtonsDiv.appendChild(loginButton);
  primaryButtonsDiv.appendChild(searchImageIcon);
  // Append primary buttons
  const primaryButtonsList = getPrimaryButtonsList(fragment);
  primaryButtonsList.forEach((singleButton) => {
    primaryButtonsDiv.appendChild(singleButton);
  });
  row1Div.appendChild(hamburgerIconDiv);
  row1Div.appendChild(logoDiv);
  row1Div.appendChild(primaryButtonsDiv);
  block.append(topBarSection);
};

/**
 * Builds the side panel top section containing close button and logo
 * @param {*} fragment nav fragment
 * @returns the top section wrapped in div
 */
const buildSidePanelTopSection = (fragment) => {
  const sidePanelTopAreaDiv = document.createElement('div');
  sidePanelTopAreaDiv.className = 'top-area';
  const topAreaCloseButtonDiv = document.createElement('div');
  topAreaCloseButtonDiv.className = 'top-area-closebutton';
  topAreaCloseButtonDiv.innerHTML = `
    <div class="hamburger-menu-close close-button" id="hamburger-menu-close-icon">
      <div class="line line-1"></div>
      <div class="line line-2"></div>
    </div>
  `;
  sidePanelTopAreaDiv.appendChild(topAreaCloseButtonDiv);

  const sidePanelTopAreaLogo = document.createElement('div');
  sidePanelTopAreaLogo.className = 'top-area-logo';
  const sidePanelLogoDetails = fragment.querySelector('.section.side-panel-icici-logo');
  const sidePanelImageAltData = sidePanelLogoDetails.getAttribute('data-image-alt');
  const sidePanelImageTag = sidePanelLogoDetails.querySelector('img');
  sidePanelImageTag.alt = sidePanelImageAltData;
  sidePanelTopAreaLogo.appendChild(sidePanelImageTag);
  sidePanelTopAreaDiv.appendChild(sidePanelTopAreaLogo);
  return sidePanelTopAreaDiv;
};

/**
 * Builds the side panel top area containing primary buttons
 * @param {*} fragment nav fragment
 * @returns the side panel primary buttons wrapped in div
 */
const buildSidePanelBottomSection = (fragment) => {
  const sidePanelBottomAreaDiv = document.createElement('div');
  sidePanelBottomAreaDiv.className = 'bottom-area';
  const bottomAreaPrimaryButtonsDiv = document.createElement('div');
  bottomAreaPrimaryButtonsDiv.className = 'bottom-area-primary-actions';
  const sidePanelPrimaryButtonItems = fragment.querySelectorAll('.section.side-panel-primary-actions li');
  sidePanelPrimaryButtonItems.forEach((item) => {
    const buttonName = item.innerText;
    const buttonLinkNode = item.querySelector('a');
    const url = buttonLinkNode?.getAttribute('href');
    const linkTag = document.createElement('a');
    linkTag.href = url || '';
    const singleButton = document.createElement('button');
    singleButton.innerText = buttonName;
    singleButton.className = 'round-button';
    singleButton.type = 'button';
    singleButton.innerText = item.textContent;
    linkTag.appendChild(singleButton);
    bottomAreaPrimaryButtonsDiv.appendChild(linkTag);
  });
  sidePanelBottomAreaDiv.appendChild(bottomAreaPrimaryButtonsDiv);
  return sidePanelBottomAreaDiv;
};

/**
 * Builds the side panel secondary items list in accordion
 * @param {*} fragment nav fragment
 * @returns the accordion wrapped in div
 */
const buildSidePanelAccordion = (fragment) => {
  const sidePanelSecondaryItems = document.createElement('div');
  sidePanelSecondaryItems.className = 'bottom-area-item-list';
  const accordionWrapperDiv = document.createElement('div');
  accordionWrapperDiv.className = 'accordion-wrapper';
  const accordion = document.createElement('div');
  accordion.className = 'accordion';

  const sidePanelList = fragment.querySelector('.section.side-panel-secondary-actions ul');
  const sidePanelItemsList = sidePanelList.children;
  Array.from(sidePanelItemsList).forEach((item) => {
    const accordionItemDetails = document.createElement('details');
    accordionItemDetails.className = 'accordion-item';
    const accordionItemLabel = document.createElement('summary');
    accordionItemLabel.className = 'accordion-item-label';
    const categoryLinkNode = item.querySelector('a');
    const categoryUrl = categoryLinkNode?.getAttribute('href') || '';
    const categoryName = categoryLinkNode?.innerText || item.firstChild.data;
    accordionItemLabel.innerHTML = `
      <div><a href=${categoryUrl}>${categoryName}</a></div>
      <div class="accordion-item-expand">+</div>
    `;

    const accordionItemBody = document.createElement('div');
    accordionItemBody.className = 'accordion-item-body';
    const accordionSubitemList = document.createElement('div');
    accordionSubitemList.className = 'accordion-subitem-list';

    const subitemsList = item.querySelectorAll('li');
    subitemsList.forEach((subitem) => {
      const subItemLinkNode = subitem.querySelector('a');
      const subItemUrl = subItemLinkNode?.getAttribute('href') || '';
      const subitemName = subItemLinkNode?.innerText || subitem.textContent;
      const accordionSubitem = document.createElement('div');
      accordionSubitem.className = 'accordion-subitem';
      if (subitemName.includes('[new]')) {
        const replacedSubitemName = subitemName.replace(/\[new\]/g, '').trim();
        accordionSubitem.innerHTML = `
          <a href=${subItemUrl}>${replacedSubitemName}</a>
          <img class="new-item-logo" alt="new" src="../../icons/new-img.svg" width="20px"></img>
        `;
      } else {
        accordionSubitem.innerHTML = `
          <a href=${subItemUrl}>${subitemName}</a>
        `;
      }
      accordionSubitemList.appendChild(accordionSubitem);
    });

    accordionItemBody.appendChild(accordionSubitemList);
    accordionItemDetails.appendChild(accordionItemLabel);
    accordionItemDetails.appendChild(accordionItemBody);
    accordion.appendChild(accordionItemDetails);
  });

  accordionWrapperDiv.appendChild(accordion);
  sidePanelSecondaryItems.appendChild(accordionWrapperDiv);
  return sidePanelSecondaryItems;
};

/**
 * build the hamburger side panel
 * @param {*} fragment nav page fragment
 * @param {*} block
 */
const decorateHamburgerPanel = (fragment, block) => {
  const sidePanelDiv = document.createElement('div');
  sidePanelDiv.className = 'sidepanel';
  sidePanelDiv.id = 'hamburger-side-panel';
  // build side panel top area
  const sidePanelTopAreaDiv = buildSidePanelTopSection(fragment);
  // build the side panel bottom area
  const sidePanelBottomAreaDiv = buildSidePanelBottomSection(fragment);
  // build the side panel accordion
  const sidePanelSecondaryItems = buildSidePanelAccordion(fragment);

  sidePanelBottomAreaDiv.appendChild(sidePanelSecondaryItems);
  sidePanelDiv.appendChild(sidePanelTopAreaDiv);
  sidePanelDiv.appendChild(sidePanelBottomAreaDiv);
  block.append(sidePanelDiv);
};

/**
 * Event handlers specific to header blocks
 */
const addHeaderEventHandlers = () => {
  /**
   * Handler for changing the plus icon to minus icon when sub items are
   * expanded in the hamburger list
   */
  const detailsElements = document.querySelectorAll('.accordion details');
  const sidePanelListExpandHandler = (event) => {
    const targetElement = event.target;
    const detailsElement = targetElement.closest('details');
    const expandIcon = detailsElement.querySelector('.accordion-item-expand');
    if (detailsElement.open && expandIcon) {
      expandIcon.innerHTML = '+';
    } else {
      expandIcon.innerHTML = '-';
    }
  };
  detailsElements.forEach((detailsElement) => {
    detailsElement.addEventListener('click', sidePanelListExpandHandler);
  });

  /**
   * Handler for opening and closing hamburger side panel
   */
  const hamburgerMenuIcon = document.getElementById('hamburger-menu-icon');
  const hamburgerMenuCloseIcon = document.getElementById('hamburger-menu-close-icon');
  const hamburgerSidePanel = document.getElementById('hamburger-side-panel');
  const hamburgerCloseHandler = (event) => {
    const isOpenIconClicked = hamburgerMenuIcon?.contains(event.target);
    const isCloseIconClicked = hamburgerMenuCloseIcon?.contains(event.target);
    const isClickedOnSlidePanel = hamburgerSidePanel?.contains(event.target);
    if (isOpenIconClicked) {
      hamburgerSidePanel?.classList.add('open');
    } else if (isCloseIconClicked || !isClickedOnSlidePanel) {
      hamburgerSidePanel?.classList.remove('open');
    }
  };
  document.addEventListener('click', hamburgerCloseHandler);
};

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  // TODO: meta data in the document is not working
  const navPath = navMeta ? new URL(navMeta).pathname : '/draft/vivesing/nav';
  const fragment = await loadFragment(navPath);
  // Global navigator  starts here
  decorateGlobalNavigationBar(fragment, block);
  // Top bar section starts here
  decorateTopBarPanel(fragment, block);
  // side panel section starts here
  decorateHamburgerPanel(fragment, block);
  // add header specific handlers
  addHeaderEventHandlers();
}
