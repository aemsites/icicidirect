import { createDiv } from '../../scripts/blocks-utils.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    [...row.children].forEach((col, index) => {
      if (index === 0) {
        col.className = 'cards-title';
      } else if (index === 1) {
        col.className = 'cards-description';
      } else if (index === 2) {
        col.className = 'cards-powerby';
        const powerbyContent = createDiv('div', '');
        const powerbyIcon = createDiv('div', 'socialshare');
        powerbyContent.append(...col.childNodes);
        const button = createDiv('button', '');
        const image = createDiv('img', '');
        image.src = '../../icons/gray-share-icon.svg';
        image.alt = 'gray-share-icon';
        button.append(image);
        powerbyIcon.append(button);
        col.append(powerbyContent);
        col.append(powerbyIcon);
      }
      li.append(col);
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
