function createDiv(tagname, className) {
  const div = document.createElement(tagname);
  if (className) {
    div.classList.add(className);
  }
  return div;
}

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
  const titleTag = createDiv('h2', '');
  titleTag.textContent = title;
  const image = createDiv('img', '');
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
      const i = createDiv('i', '');
      itemTitle.append(i);
      addEvent(itemTitle, block);
    }
    if (itemContent) {
      itemContent.classList.add('faq-item-content');
      const div = createDiv('div', '');
      const p = createDiv('p', '');
      p.append(...itemContent.childNodes);
      div.append(p);
      itemContent.replaceChildren(div);
    }
  });
}

function decorateButton(faqButton, block, buttonTitle, expendButtonTitle) {
  const button = createDiv('button', 'button');
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
  const faqTitle = createDiv('div', 'faq-title');
  const faqContent = createDiv('div', 'faq-content');
  const faqButton = createDiv('div', 'more-button');
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
