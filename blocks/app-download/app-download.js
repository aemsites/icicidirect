import { createOptimizedPicture } from '../../scripts/aem.js';
import { getHostUrl } from '../../scripts/blocks-utils.js';

export default function decorate(block) {
  const pictures = block.querySelectorAll('picture');
  const qrImage = pictures[pictures.length - 1];
  qrImage.parentNode.className = 'qrcode';
  const firstButtonContainer = block.querySelector('p.button-container');
  const storeDiv = firstButtonContainer.parentNode;
  storeDiv.classList.add('store');
  const buttonContainers = storeDiv.querySelectorAll('p.button-container');
  buttonContainers.forEach((buttonContainer) => {
    const anchorTag = buttonContainer.querySelector('a');
    const badgeName = anchorTag.text.toLowerCase();
    const picture = createOptimizedPicture(`${getHostUrl()}/icons/${badgeName}-badge.webp`);
    anchorTag.text = '';
    anchorTag.append(picture);
    storeDiv.appendChild(anchorTag);
    buttonContainer.remove();
  });
}
