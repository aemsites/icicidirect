import { getBlockKeyValue } from '../../scripts/aem.js';

const options = {
  root: null,
  threshold: 0.7,
};

/**
 * Marks the link in the quicklinks section as active for the section visible in the view port
 * @param {*} elementId that is currently visible in the view port
 */
const activateSectionInView = (elementId) => {
  // Remove active class from previous active sections
  const currentActiveElements = document.querySelectorAll('.block.quicklinks .quicklinks-container a.active');
  currentActiveElements.forEach((item) => {
    item.classList.remove('active');
  });
  // Set new section as active which is in viewport
  const quickLinkElement = document.querySelector(`[href="#${elementId}"]`);
  quickLinkElement.classList.add('active');
};

/**
 * Function to handle the intersecting section of the page with quicklink enabled
 */
const handlePageSectionIntersection = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const elementId = entry.target.id;
      activateSectionInView(elementId);
    }
  });
};

/**
 * Makes the quick links section sticky on the top of the page when scrolled into view
 * @param {*} parentContainer the parent section of the quicklinks block
 * @param {*} block the quicklinks block
 */
const enableStickyBehaviorForQuickLinks = (parentContainer, block) => {
  const quickLinksOptions = {
    root: null,
    threshold: 0,
  };
  const intersectionHandler = (entires) => {
    entires.forEach((entry) => {
      if (!entry.isIntersecting && entry.boundingClientRect.y < 0) {
        block.classList.add('sticky');
      } else {
        block.classList.remove('sticky');
      }
    });
  };
  const observer = new IntersectionObserver(intersectionHandler, quickLinksOptions);
  observer.observe(parentContainer);
};

/**
 * Decorate the quick links block
 * @param {Element} block The quicklinks block element
 */
export default function decorate(block) {
  // extract title from the block data
  const blockTitle = getBlockKeyValue(block, 'Title');
  block.innerText = '';
  const titleDiv = document.createElement('h2');
  titleDiv.className = 'quicklinks-title';
  titleDiv.innerText = blockTitle;
  block.append(titleDiv);

  // extract quicklinks from the complete page
  const quickLinkContainerDiv = document.createElement('div');
  quickLinkContainerDiv.className = 'quicklinks-container';
  const quickLinkEnabledBlocks = document.querySelectorAll('[data-quicklinks-title]');

  // Create a new intersection observer
  const observer = new IntersectionObserver(handlePageSectionIntersection, options);
  quickLinkEnabledBlocks.forEach((singleItem) => {
    const linkId = singleItem.id;
    const linkTitle = singleItem.getAttribute('data-quicklinks-title');
    const linkNode = document.createElement('a');
    linkNode.href = `#${linkId}`;
    linkNode.innerText = linkTitle;
    quickLinkContainerDiv.appendChild(linkNode);
    // observe other sections of the page when scrolled
    observer.observe(singleItem);
  });
  block.append(quickLinkContainerDiv);

  // enable sticky quicklinks when page is scrolled
  const parentContainer = document.querySelector('.section.quicklinks-container');
  enableStickyBehaviorForQuickLinks(parentContainer, block);
}
