import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

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

  // Top bar section starts here
  const topBarSection = document.createElement('div');
  topBarSection.className = 'top-bar';
  const topBarContainerDiv = document.createElement('div');
  topBarContainerDiv.className = 'container';
  topBarContainerDiv.id = 'top-bar';
  topBarSection.append(topBarContainerDiv);
  const row1Div = document.createElement('div');
  row1Div.className = 'row1';
  topBarContainerDiv.appendChild(row1Div);

  const hamburgerIconDiv = document.createElement('div');
  hamburgerIconDiv.className = 'hamburger-menu';
  hamburgerIconDiv.id = 'hamburger-menu-icon';
  hamburgerIconDiv.innerHTML = `
    <div></div>
    <div></div>
    <div></div>
  `;

  // Main ICICI Logo decoration
  const logoDiv = document.createElement('div');
  logoDiv.className = 'logo';
  const headerLogoDetails = fragment.querySelector('.section.icici-logo');
  const imageAltData = headerLogoDetails.getAttribute('data-image-alt');
  const imageTag = headerLogoDetails.querySelector('img');
  imageTag.alt = imageAltData;
  logoDiv.appendChild(imageTag);

  const primaryButtonsDiv = document.createElement('div');
  primaryButtonsDiv.className = 'primary-buttons';
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

  const loginButton = document.createElement('button');
  loginButton.classList.add('round-button', 'mobile-element');
  loginButton.innerHTML = 'LOGIN';

  const searchImageIcon = document.createElement('img');
  searchImageIcon.classList.add('search-icon', 'mobile-element');
  searchImageIcon.src = '../../icons/icon-search.svg';
  searchImageIcon.alt = 'Search';

  primaryButtonsDiv.appendChild(searchBarDiv);
  primaryButtonsDiv.appendChild(loginButton);
  primaryButtonsDiv.appendChild(searchImageIcon);

  const primaryButtonItems = fragment.querySelectorAll('.section.primary-buttons li');
  primaryButtonItems.forEach((singleItem, index) => {
    const singleButton = document.createElement('button');
    singleButton.classList.add('round-button');
    if (index === 0) {
      singleButton.classList.add('gradient-orange');
    } else {
      singleButton.classList.add('desktop-element');
    }
    singleButton.appendChild(singleItem);
    primaryButtonsDiv.appendChild(singleButton);
  });

  row1Div.appendChild(hamburgerIconDiv);
  row1Div.appendChild(logoDiv);
  row1Div.appendChild(primaryButtonsDiv);
  block.append(topBarSection);

  // side panel section starts here

  const sidePanelDiv = document.createElement('div');
  sidePanelDiv.className = 'sidepanel';
  sidePanelDiv.id = 'hamburger-side-panel';

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

  const sidePanelBottomAreaDiv = document.createElement('div');
  sidePanelBottomAreaDiv.className = 'bottom-area';
  const bottomAreaPrimaryButtonsDiv = document.createElement('div');
  bottomAreaPrimaryButtonsDiv.className = 'bottom-area-primary-actions';
  const sidePanelPrimaryButtonItems = fragment.querySelectorAll('.section.side-panel-primary-actions li');
  sidePanelPrimaryButtonItems.forEach((item) => {
    const singleButton = document.createElement('button');
    singleButton.className = 'round-button';
    singleButton.type = 'button';
    singleButton.innerText = item.textContent;
    bottomAreaPrimaryButtonsDiv.appendChild(singleButton);
  });
  sidePanelBottomAreaDiv.appendChild(bottomAreaPrimaryButtonsDiv);

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
    const categoryName = item.firstChild.data;
    accordionItemLabel.innerHTML = `
      <div><a href="">${categoryName}</a></div>
      <div class="accordion-item-expand">+</div>
    `;

    const accordionItemBody = document.createElement('div');
    accordionItemBody.className = 'accordion-item-body';
    const accordionSubitemList = document.createElement('div');
    accordionSubitemList.className = 'accordion-subitem-list';

    const subitemsList = item.querySelectorAll('li');
    subitemsList.forEach((subitem) => {
      const accordionSubitem = document.createElement('div');
      accordionSubitem.className = 'accordion-subitem';
      const subitemName = subitem.textContent;
      if (subitemName.includes('[new]')) {
        const replacedSubitemName = subitemName.replace(/\[new\]/g, '').trim();
        accordionSubitem.innerHTML = `
          <a href="">${replacedSubitemName}</a>
          <img class="new-item-logo" alt="new" src="../../icons/new-img.svg" width="20px"></img>
        `;
      } else {
        accordionSubitem.innerHTML = `
          <a href="">${subitemName}</a>
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

  sidePanelBottomAreaDiv.appendChild(sidePanelSecondaryItems);

  sidePanelDiv.appendChild(sidePanelTopAreaDiv);
  sidePanelDiv.appendChild(sidePanelBottomAreaDiv);
  block.append(sidePanelDiv);

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
}
