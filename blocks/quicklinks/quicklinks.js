import { getBlockKeyValue } from '../../scripts/aem.js';

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
  quickLinkEnabledBlocks.forEach((singleItem) => {
    const linkId = singleItem.id;
    const linkTitle = singleItem.getAttribute('data-quicklinks-title');
    const linkNode = document.createElement('a');
    linkNode.href = `#${linkId}`;
    linkNode.innerText = linkTitle;
    quickLinkContainerDiv.appendChild(linkNode);
  });
  block.append(quickLinkContainerDiv);
}
