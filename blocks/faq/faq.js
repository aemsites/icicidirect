function createDiv(tagname, className) {
    const div = document.createElement(tagname);
    if (className) {
        div.classList.add(className);
    }
    return div;
}

function addEvent(faqTitle) {
    faqTitle.addEventListener('click', () => {
      ul.classList.toggle('visible');
      title.classList.toggle('visible');
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

function decorateContent(faqContent) {
    [...faqContent.children].forEach((row, index) => {
        const itemTitle = row.firstElementChild;
        const itemContent = row.lastElementChild;
        if (itemTitle) {
            itemTitle.classList.add('faq-item-title');
            addEvent(itemTitle);
        }
        if (itemContent) {
            itemContent.classList.add('faq-item-content');
        }
    });
}

function decorateButton(faqButton) {
    const aLink = createDiv('a', 'btn');
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
    decorateContent(faqContent);
    decorateButton(faqButton);



    block.replaceChildren(faqTitle);
    block.appendChild(faqContent);
    block.appendChild(faqButton);
}