import { readBlockConfig } from '../../scripts/aem.js';
import { createElement } from '../../scripts/blocks-utils.js';

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
  const mobileNumberInput = document.querySelector('.block.sign-up .phoneNumberTextBox');
  const mobileNumber = mobileNumberInput.value;
  // Check for valid mobile number format
  const mobileRegex = /^([0]|\+91)?[6789]\d{9}$/;
  const validationMessage = document.querySelector('.block.sign-up .signupContainer .error-message');
  if (!mobileNumber || mobileNumber.length < 10 || !mobileRegex.test(mobileNumber)) {
    validationMessage.classList.add('invalid');
  } else {
    validationMessage.classList.remove('invalid');
    const navigationLink = event.target.href;
    initiateAccountCreation(navigationLink, mobileNumber);

    // TBD : need ajax call for otp generation etc
  }
};

function blockNonNumbers(event) {
  const inputElement = event.target;
  inputElement.value = inputElement.value.replace(/[^0-9]/g, '');
}

function createMobileNumberInput(placeholderText) {
  const inputElement = createElement('input', 'phoneNumberTextBox');
  inputElement.type = 'text';
  inputElement.placeholder = placeholderText;
  inputElement.maxLength = '10';
  inputElement.pattern = '[0-9]*';
  inputElement.autocomplete = 'off';
  inputElement.addEventListener('input', blockNonNumbers);
  return inputElement;
}

function createSubmitButton(buttontitle) {
  const buttonElement = createElement('button', 'signupbtn');
  buttonElement.textContent = buttontitle;
  buttonElement.addEventListener('click', handleOpenAccountSubmit);
  return buttonElement;
}
function createErrorSpan(errormessage) {
  const spanElement = createElement('span', 'error-message');
  spanElement.textContent = errormessage;
  return spanElement;
}
function createTitle(titleHTML) {
  const col1Div = createElement('div', 'signupsections');
  const titleWrapDiv = createElement('div', 'title_wrap');
  const h2Element = createElement('h2', '');
  h2Element.innerHTML = titleHTML.innerHTML;
  h2Element.classList.add('text-left');
  titleWrapDiv.appendChild(h2Element);
  col1Div.appendChild(titleWrapDiv);
  return col1Div;
}
function createSignUpElement(
  signupString,
  promotionalText,
  placeholderText,
  buttontitle,
  errormessage,
) {
  const signupFormDiv = createElement('div', 'signupsections');

  const formGroupDiv = createElement('div', 'signup-form-group');
  formGroupDiv.classList.add('text-center');

  const labelElement = createElement('label', '');
  // labelElement.innerHTML = 'Sign up for a <strong>New Account</strong>';
  labelElement.innerHTML = signupString.innerHTML;

  const promotionalSpan = createElement('span', 'promotionalText');
  promotionalSpan.textContent = promotionalText;

  const formFieldsDiv = createElement('div', '');
  const mobileInput = createMobileNumberInput(placeholderText);
  const tunrstileContainer = createElement('div', 'turnstile-container');
  const submitButton = createSubmitButton(buttontitle, errormessage);
  const errorSpan = createErrorSpan(errormessage);

  formFieldsDiv.appendChild(mobileInput);
  formFieldsDiv.appendChild(tunrstileContainer);
  formFieldsDiv.appendChild(submitButton);

  formGroupDiv.appendChild(labelElement);
  formGroupDiv.appendChild(promotionalSpan);
  formGroupDiv.appendChild(formFieldsDiv);
  formGroupDiv.appendChild(errorSpan);

  signupFormDiv.appendChild(formGroupDiv);

  return signupFormDiv;
}
function findHTMLElementFromBock(block, key) {
  const parentDivs = block.querySelectorAll('.sign-up > div');
  for (let i = 0; i < parentDivs.length; i++) {
    const parentDiv = parentDivs[i];
    // Select the first and second child divs
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
  sectionDiv.classList.add('margin', 'signupContainer');

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
/*
1. how to give strong etc

10. poppins-light for open
*/
