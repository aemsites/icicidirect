import { readBlockConfig, fetchPlaceholders, toCamelCase } from '../../scripts/aem.js';
import {
  div, input, a, p,
} from '../../scripts/dom-builder.js';

/**
 * Makes the sticky footer visible when the parent container is scrolled out of view port on top
 * @param {*} block that should be made sticky
 */
const showStickyFooterWhenScrolled = (block) => {
  const stickyFooterOptions = {
    root: null,
    threshold: 0,
  };
  const intersectionHandler = (entires) => {
    entires.forEach((entry) => {
      if (!entry.isIntersecting && entry.boundingClientRect.y < 0) {
        block.classList.add('sticky');
      } else {
        block.classList.remove('sticky');
      }
    });
  };
  const observer = new IntersectionObserver(intersectionHandler, stickyFooterOptions);
  const parentDiv = document.querySelector('.section.sticky-footer-container');
  observer.observe(parentDiv);
};

/**
 * Actions to be performed for account creation when mobile number is valid
 * @param {*} url account opening url
 * @param {*} mobileNumber the mobile number entered by user
 */
const initiateAccountCreation = (url, mobileNumber) => {
  // TODO: Handle what needs to be for login
  window.open(`${url}?mobile=${mobileNumber}`, '_blank');
};

/**
 * Handler for submit button click
 * @param {*} event
 */
const handleOpenAccountSubmit = (event) => {
  event.preventDefault();
  const mobileNumberInput = document.querySelector('.block.sticky-footer .action-container input');
  const mobileNumber = mobileNumberInput.value;
  // Check for valid mobile number format
  const mobileRegex = /^([0]|\+91)?[6789]\d{9}$/;
  const validationMessage = document.querySelector('.block.sticky-footer .message-container .validation-message');
  if (!mobileNumber || mobileNumber.length < 10 || !mobileRegex.test(mobileNumber)) {
    validationMessage.classList.add('invalid');
  } else {
    validationMessage.classList.remove('invalid');
    const navigationLink = event.target.href;
    initiateAccountCreation(navigationLink, mobileNumber);
  }
};

/**
 * Handler for when open trading account button is clicked
 * @param {*} event
 */
const handleOpenTradingAcSubmit = (event) => {
  event.preventDefault();
  // TODO: Handle what needs to be for account creation
  window.open(event.target.href, '_blank');
};

/**
 * Validates the mobile number input format to accept only numbers and max length is 10
 * @param {*} event
 */
const handleMobileNumberValidation = (event) => {
  const targetInput = event.target;
  // Allow only numeric values
  targetInput.value = targetInput.value.replace(/[^0-9]/g, '');
  // Allow maximum 10 characters
  if (targetInput.value.length > 10) {
    targetInput.value = targetInput.value.slice(0, 10);
  }
};

export default async function decorate(block) {
  // extract open account button linl from the block data
  const blockConfig = readBlockConfig(block);
  const openAccountUrl = blockConfig['open-account-link'] || '';
  const openTradingAccrountUrl = blockConfig['open-trading-account-link'] || '';
  block.innerText = '';

  const placeholders = await fetchPlaceholders();

  const stickyFooterWrapper = div({ class: 'sticky-footer-bottom' });
  const stickyFooterContainer = div({ class: 'action-container' });

  const mobileNumberField = input({ class: 'mobilenumber' });
  mobileNumberField.placeholder = placeholders[toCamelCase('MobileNumberPlaceholder')];
  mobileNumberField.addEventListener('input', handleMobileNumberValidation);
  stickyFooterContainer.appendChild(mobileNumberField);

  const tunrstileContainer = div({ class: 'turnstile-container' });
  stickyFooterContainer.appendChild(tunrstileContainer);

  const openAccountButton = div({ class: 'open-account' });
  const aLink = a({ class: 'discover-more-button' });
  aLink.href = openAccountUrl;
  aLink.textContent = placeholders[toCamelCase('OpenAccountButton')];
  aLink.addEventListener('click', handleOpenAccountSubmit);
  openAccountButton.appendChild(aLink);
  stickyFooterContainer.appendChild(openAccountButton);
  stickyFooterWrapper.appendChild(stickyFooterContainer);

  const validationContainer = div({ class: 'message-container' });
  const message = p({ class: 'validation-message' });
  message.innerText = placeholders[toCamelCase('InvalidMobileNumber')];
  validationContainer.appendChild(message);
  stickyFooterWrapper.appendChild(validationContainer);

  const rightStickyButton = div({ class: 'sticky-footer-right' });
  const openTradingAccountButton = div({ class: 'open-trading-account' });
  const tradingALink = a({ class: 'open-trading-button' });
  tradingALink.href = openTradingAccrountUrl;
  tradingALink.textContent = placeholders[toCamelCase('OpenTradingAccountButton')];
  tradingALink.addEventListener('click', handleOpenTradingAcSubmit);
  openTradingAccountButton.appendChild(tradingALink);
  rightStickyButton.appendChild(openTradingAccountButton);

  block.append(stickyFooterWrapper);
  block.append(rightStickyButton);
  showStickyFooterWhenScrolled(block);
}
