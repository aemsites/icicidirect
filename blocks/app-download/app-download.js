import { createOptimizedPicture } from "../../scripts/aem.js";
import { getHostUrl } from "../../scripts/mockapi.js";

export default function decorate(block) {
  const qrImage = block.querySelector('picture');
  qrImage.parentNode.className = 'qrcode';
  const firstButtonContainer = block.querySelector('p.button-container');
  // Get its parent div
  const storeDiv = firstButtonContainer.parentNode;
  storeDiv.classList.add('store');
  // Select all button container paragraphs
  const buttonContainers = storeDiv.querySelectorAll('p.button-container');
  // Iterate through each button container
  buttonContainers.forEach((buttonContainer) => {
    // Get the anchor tag inside the button container
    const anchorTag = buttonContainer.querySelector('a');
    const badgeName = anchorTag.text.toLowerCase();
    const picture = createOptimizedPicture(`${getHostUrl()}/icons/${badgeName}.png`);
    anchorTag.text = '';
    anchorTag.append(picture);
    // Move the anchor tag directly under the div
    storeDiv.appendChild(anchorTag);
    // Remove the button container paragraph
    buttonContainer.remove();
  });
}
