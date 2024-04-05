import { readBlockConfig } from '../../scripts/aem.js';
import { createElement } from '../../scripts/blocks-utils.js';

/**
 * Handler for submit button click
 * @param {*} event
 */
const handleOpenAccountSubmit = (event) => {
  event.preventDefault();
  const mobileNumberInput = document.querySelector('.block.sign-up .phonenumber-textbox');
  const mobileNumber = mobileNumberInput.value;
  // Check for valid mobile number format
  const mobileRegex = /^([0]|\+91)?[6789]\d{9}$/;
  const validationMessage = document.querySelector('.block.sign-up .signup-container .error-message');
  if (!mobileNumber || mobileNumber.length < 10 || !mobileRegex.test(mobileNumber)) {
    validationMessage.classList.add('invalid');
  } else {
    validationMessage.classList.remove('invalid');
    // TBD : need ajax call for otp generation etc
  }
};

/**
 * Removes non-numeric characters from the input value.
 * @param {Event} event - The event object triggered by the input element.
 */
function blockNonNumbers(event) {
  const inputElement = event.target;
  inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
}

function createMobileNumberInput(placeholderText) {
  const inputElement = createElement('input', 'phonenumber-textbox');
  inputElement.type = 'text';
  inputElement.placeholder = placeholderText;
  inputElement.maxLength = '10';
  inputElement.pattern = '[0-9]*';
  inputElement.autocomplete = 'off';
  inputElement.addEventListener('input', blockNonNumbers);
  return inputElement;
}

function createSubmitButton(buttontitle) {
  const submitButton = createElement('button', 'signupbtn');
  submitButton.textContent = buttontitle;
  submitButton.addEventListener('click', handleOpenAccountSubmit);
  return submitButton;
}
function createErrorSpan(errormessage) {
  const spanElement = createElement('span', 'error-message');
  spanElement.textContent = errormessage;
  return spanElement;
}
function createTitle(titleHTML) {
  const col1Div = createElement('div', 'signupsections');
  const titleWrapDiv = createElement('div', 'title-wrap');
  const h2Element = createElement('h2', '');
  h2Element.innerHTML = titleHTML.innerHTML;
  h2Element.classList.add('text-left');
  titleWrapDiv.appendChild(h2Element);
  col1Div.appendChild(titleWrapDiv);
  return col1Div;
}
function createSignUpElement(
  signupString,
  promotionaltext,
  placeholderText,
  buttontitle,
  errormessage,
) {
  const signupFormDiv = createElement('div', 'signupsections');

  const formGroupDiv = createElement('div', 'signup-form-group');
  formGroupDiv.classList.add('text-center');

  const signupStringElement = createElement('label', '');
  signupStringElement.innerHTML = signupString.innerHTML;

  const promotionalSpan = createElement('span', 'promotional-text');
  promotionalSpan.textContent = promotionaltext;

  const formFieldsDiv = createElement('div', '');
  const mobileInput = createMobileNumberInput(placeholderText);
  const tunrstileContainer = createElement('div', 'turnstile-container');
  const submitButton = createSubmitButton(buttontitle, errormessage);
  const errorSpan = createErrorSpan(errormessage);

  formFieldsDiv.appendChild(mobileInput);
  formFieldsDiv.appendChild(tunrstileContainer);
  formFieldsDiv.appendChild(submitButton);

  formGroupDiv.appendChild(signupStringElement);
  formGroupDiv.appendChild(promotionalSpan);
  formGroupDiv.appendChild(formFieldsDiv);
  formGroupDiv.appendChild(errorSpan);

  signupFormDiv.appendChild(formGroupDiv);
  return signupFormDiv;
}
/**
 * Finds an HTML element from a block based on a given key.
 * @param {HTMLElement} block - The block to search within.
 * @param {string} key - The key to search for within the block.
 * @returns {HTMLElement|string} - The found HTML element or an empty string if no match is found.
 */
function findHTMLElementFromBock(block, key) {
  const parentDivs = block.querySelectorAll('.sign-up > div');
  for (let i = 0; i < parentDivs.length; i += 1) {
    const parentDiv = parentDivs[i];
    const firstChildDiv = parentDiv.querySelector(':nth-child(1)');
    const secondChildDiv = parentDiv.querySelector(':nth-child(2)');
    if (firstChildDiv.textContent.includes(key)) {
      return secondChildDiv;
    }
  }
  return '';
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const {
    promotionaltext, placeholdertext, buttontitle, errormessage,
  } = blockConfig;

  const titleHTML = findHTMLElementFromBock(block, 'title');
  const signupstringHTML = findHTMLElementFromBock(block, 'signupString');
  const sectionDiv = createElement('div', 'section');
  sectionDiv.classList.add('margin', 'signup-container');

  const articleElement = createElement('article', '');
  const rowDiv = createElement('div', 'row');
  rowDiv.classList.add('justify-content-center', 'align-items-center');

  const titleField = createTitle(titleHTML);
  const signupElementDiv = createSignUpElement(
    signupstringHTML,
    promotionaltext,
    placeholdertext,
    buttontitle,
    errormessage,
  );
  rowDiv.appendChild(titleField);
  rowDiv.appendChild(signupElementDiv);
  articleElement.appendChild(rowDiv);
  sectionDiv.appendChild(articleElement);
  block.textContent = '';
  block.appendChild(sectionDiv);
}
