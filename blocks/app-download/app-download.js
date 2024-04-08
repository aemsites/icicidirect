import { createOptimizedPicture } from '../../scripts/aem.js';
import { getHostUrl } from '../../scripts/mockapi.js';

export default function decorate(block) {
  const qrImage = block.querySelector('picture');
  qrImage.parentNode.className = 'qrcode';
  const firstButtonContainer = block.querySelector('p.button-container');
  const storeDiv = firstButtonContainer.parentNode;
  storeDiv.classList.add('store');
  const buttonContainers = storeDiv.querySelectorAll('p.button-container');
  buttonContainers.forEach((buttonContainer) => {
    const anchorTag = buttonContainer.querySelector('a');
    const badgeName = anchorTag.text.toLowerCase();
    const picture = createOptimizedPicture(`${getHostUrl()}/icons/${badgeName}-badge.png`);
    anchorTag.text = '';
    anchorTag.append(picture);
    storeDiv.appendChild(anchorTag);
    buttonContainer.remove();
  });
}
