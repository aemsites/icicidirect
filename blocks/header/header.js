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

  const logoDiv = document.createElement('div');
  logoDiv.className = 'logo';
  const logoImage = document.createElement('img');
  logoImage.src = './icicilogo.svg';
  logoImage.alt = 'ICICI Logo';
  logoImage.width = '150px';
  logoDiv.appendChild(logoImage);

  const primaryButtonsDiv = document.createElement('div');
  primaryButtonsDiv.className = 'primary-buttons';
  const searchBarDiv = document.createElement('div');
  searchBarDiv.className = 'search-bar';

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
      <img class="search-icon" src="./icon-search.png" alt="Search">
    </div>
  `;
  searchBarDiv.appendChild(categoryPickerDiv);
  searchBarDiv.appendChild(searchBoxDiv);

  const loginButton = document.createElement('button');
  loginButton.classList.add('round-button', 'mobile-element');
  loginButton.innerHTML = 'LOGIN';

  const searchImageIcon = document.createElement('img');
  searchImageIcon.classList.add('search-icon', 'mobile-element');

  primaryButtonsDiv.appendChild(searchBarDiv);
  primaryButtonsDiv.appendChild(loginButton);

  const primaryButtonItems = fragment.querySelectorAll('.section.primary-buttons li');
  primaryButtonItems.forEach((singleItem, index) => {
    const singleButton = document.createElement('button');
    singleButton.classList.add('round-button', 'desktop-element');
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
}
