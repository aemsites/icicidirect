import { readBlockConfig, fetchPlaceholders, toCamelCase } from '../../scripts/aem.js';
import {
  div, input, a, p,
} from '../../scripts/dom-builder.js';

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
const handleSubmit = (event) => {
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
  block.innerText = '';

  const placeholders = await fetchPlaceholders();

  const stickyFooterWrapper = div({ class: 'sticky-footer-container' });
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
  aLink.addEventListener('click', handleSubmit);
  openAccountButton.appendChild(aLink);
  stickyFooterContainer.appendChild(openAccountButton);
  stickyFooterWrapper.appendChild(stickyFooterContainer);

  const validationContainer = div({ class: 'message-container' });
  const message = p({ class: 'validation-message' });
  message.innerText = placeholders[toCamelCase('InvalidMobileNumber')];
  validationContainer.appendChild(message);
  stickyFooterWrapper.appendChild(validationContainer);

  block.append(stickyFooterWrapper);
}
