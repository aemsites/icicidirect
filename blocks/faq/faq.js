import { createElement } from '../../scripts/blocks-utils.js';

function addEvent(faqTitle, block) {
  faqTitle.addEventListener('click', () => {
    if (!faqTitle.classList.contains('visible')) {
      const title = block.querySelector('.faq-item-title.visible');
      const content = block.querySelector('.faq-item-content.visible');
      if (title) { title.classList.remove('visible'); }
      if (content) { content.classList.remove('visible'); }
    }
    faqTitle.classList.toggle('visible');
    const faqContent = faqTitle.nextElementSibling;
    if (faqContent) {
      faqContent.classList.toggle('visible');
    }
  });
}

function decorateTitle(faqTitle, title) {
  const titleTag = createElement('h2', '');
  titleTag.textContent = title;
  const image = createElement('img', '');
  image.src = '../../icons/noun-faq.svg';
  image.alt = 'noun-faq';
  titleTag.prepend(image);
  faqTitle.append(titleTag);
}

function decorateContent(faqContents, block) {
  [...faqContents.children].forEach((faqContent, index) => {
    if (index > 4) {
      faqContent.classList.add('no-visible');
    }
    const itemTitle = faqContent.firstElementChild;
    const itemContent = faqContent.lastElementChild;
    if (itemTitle) {
      itemTitle.classList.add('faq-item-title');
      const i = createElement('i', '');
      itemTitle.append(i);
      addEvent(itemTitle, block);
    }
    if (itemContent) {
      itemContent.classList.add('faq-item-content');
      const div = createElement('div', '');
      const p = createElement('p', '');
      p.append(...itemContent.childNodes);
      div.append(p);
      itemContent.replaceChildren(div);
    }
  });
}

function decorateButton(faqButton, block, buttonTitle, expendButtonTitle) {
  const button = createElement('button', 'button');
  button.textContent = buttonTitle;
  faqButton.append(button);
  faqButton.addEventListener('click', () => {
    const faqContents = block.querySelectorAll('.faq .faq-content > div');
    if (faqContents.length > 5) {
      faqContents.forEach((faqContent, index) => {
        if (index > 4) {
          faqContent.classList.toggle('no-visible');
        }
      });
      const showButtons = block.querySelectorAll('.no-visible');
      if (showButtons.length > 0) {
        button.textContent = buttonTitle;
      } else {
        button.textContent = expendButtonTitle;
      }
    }
  });
}

export default async function decorate(block) {
  const faqTitle = createElement('div', 'faq-title');
  const faqContent = createElement('div', 'faq-content');
  const faqButton = createElement('div', 'more-button');
  let title = '';
  let buttonTitle = '';
  let expendButtonTitle = '';
  [...block.children].forEach((child, i) => {
    if (i === 0) {
      title = [...child.children][1].innerHTML;
    } else if (i === 1) {
      buttonTitle = [...child.children][1].innerHTML;
    } else if (i === 2) {
      expendButtonTitle = [...child.children][1].innerHTML;
    } else {
      if ([...child.children].length === 3) {
        [...child.children][0].remove();
      }
      faqContent.append(child);
    }
  });
  decorateTitle(faqTitle, title);
  decorateContent(faqContent, block);
  decorateButton(faqButton, block, buttonTitle, expendButtonTitle);

  block.replaceChildren(faqTitle);
  block.appendChild(faqContent);
  block.appendChild(faqButton);
}
