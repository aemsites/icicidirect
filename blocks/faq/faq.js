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

function decorateTitle(faqTitle) {
  const titleTag = createDiv('h2', '');
  titleTag.textContent = 'FAQs';
  const image = createDiv('img', '');
  image.src = '../../icons/noun-faq.svg';
  titleTag.prepend(image);
  faqTitle.append(titleTag);
}

function decorateContent(faqContent, block) {
  [...faqContent.children].forEach((row) => {
    const itemTitle = row.firstElementChild;
    const itemContent = row.lastElementChild;
    if (itemTitle) {
      itemTitle.classList.add('faq-item-title');
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

function decorateButton(faqButton) {
  const aLink = createDiv('a', 'button');
  aLink.href = '#';
  aLink.textContent = 'Discover More';
  faqButton.append(aLink);
}

export default async function decorate(block) {
  const faqTitle = createDiv('div', 'faq-title');
  const faqContent = createDiv('div', 'faq-content');
  const faqButton = createDiv('div', 'more-button');

  decorateTitle(faqTitle);
  faqContent.append(...block.childNodes);
  decorateContent(faqContent, block);
  decorateButton(faqButton);

  block.replaceChildren(faqTitle);
  block.appendChild(faqContent);
  block.appendChild(faqButton);
}
