import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { div } from '../../scripts/dom-builder.js';

function onClick() {
  const disclaimerDiv = document.querySelector('.panel-body');
  const iconDiv = document.querySelector('.toggle-icon');
  if (disclaimerDiv.classList.contains('slide-up')) {
    // If the content is currently hidden, slide it down
    disclaimerDiv.classList.remove('slide-up');
    iconDiv.textContent = '-';
  } else {
    // If the content is currently visible, slide it up
    disclaimerDiv.classList.add('slide-up');
    iconDiv.textContent = '+';
  }
}

function decorateFooterTop(block) {
  const footerTop = block.querySelector('.footer-top');
  const sectionContainer = footerTop.querySelector('.section-container');
  const footertopWrapper = sectionContainer.children[0];
  footertopWrapper.className = 'footer-top-wrapper';
  const footerTopRow = footertopWrapper.children[0];
  footerTopRow.classList.add('footer-top', 'row');
  const children = [...footerTopRow.children];
  let index = 0;
  while (index < children.length) {
    children[index].className = `col-${index + 1}`;
    index += 1;
  }
}

function customTrim(str) {
  return str.replace(/^["'\s]+|["'\s]+$/g, '');
}

function traverseAndPrint(element, level, columnDiv) {
  if (element.tagName.toLowerCase() === 'li') {
    if (level === 3) {
      const title = document.createElement('p');
      title.classList.add('links-title');
      title.textContent = customTrim(element.childNodes[0].textContent);
      columnDiv.appendChild(title);
    } else if (level === 5) {
      columnDiv.appendChild(element.children[0]);
    }
  }
  if (element.children.length > 0) {
    for (let i = 0; i < element.children.length; i += 1) {
      traverseAndPrint(element.children[i], level + 1, columnDiv);
    }
  }
}

function decorateFooterLinks(block) {
  const footerTop = block.querySelector('.footer-links');
  const defaultWrapper = footerTop.querySelector('.default-content-wrapper');
  const row = document.createElement('div');
  row.classList.add('row');
  const children = defaultWrapper.children[0];
  defaultWrapper.innerHTML = '';
  let index = 0;
  while (index < children.children.length) {
    const columnDiv = document.createElement('div');
    columnDiv.classList.add('links-column');
    traverseAndPrint(children.children[index], 1, columnDiv);
    index += 1;
    row.appendChild(columnDiv);
  }
  defaultWrapper.appendChild(row);
}

function decorateDisclaimer(block) {
  const disclaimer = block.querySelector('.footer-disclaimer');
  const defaultWrapper = disclaimer.querySelector('.default-content-wrapper');
  const children = [...disclaimer.querySelector('.default-content-wrapper').children];
  defaultWrapper.innerHTML = '';

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('panel-header');
  const icon = document.createElement('icon');
  icon.classList.add('toggle-icon');
  icon.onclick = onClick;
  icon.textContent = '+';
  const disclaimerHeading = document.createElement('strong');
  disclaimerHeading.textContent = children[0].textContent;
  children[0].textContent = ' ';
  const panelBody = document.createElement('div');
  panelBody.classList.add('panel-body');
  panelBody.classList.add('slide-up');
  children.forEach((childElement) => {
    if (childElement.tagName === 'H3') {
      const span = document.createElement('span');
      span.textContent = childElement.textContent;
      const paragraph = document.createElement('p');
      paragraph.appendChild(span);
      panelBody.appendChild(paragraph);
    } else {
      panelBody.appendChild(childElement);
    }
  });
  headerDiv.appendChild(disclaimerHeading);
  headerDiv.appendChild(icon);
  defaultWrapper.appendChild(headerDiv);
  defaultWrapper.appendChild(panelBody);
}

function stickyFooter() {
  return div({ class: ['sticky-footer', 'turnstile-container'] });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.textContent = '';
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta.footer || '/footer';
  const fragment = await loadFragment(footerPath);
  decorateFooterTop(fragment);
  decorateFooterLinks(fragment);
  decorateDisclaimer(fragment);
  // decorate footer DOM
  const footer = document.createElement('div');
  while (fragment.firstElementChild) {
    footer.append(fragment.firstElementChild);
  }
  footer.append(stickyFooter());
  block.append(footer);
}
