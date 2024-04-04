import { readBlockConfig, fetchPlaceholders } from '../../scripts/aem.js';
import { createElement } from '../../scripts/blocks-utils.js';

function createIframeElement() {
  const iframeElement = document.createElement('iframe');
  iframeElement.src = 'https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/if/ov2/av0/rcv0/0/j7cqz/0x4AAAAAAAK3iakV3QAmUWAf/auto/normal';
  iframeElement.allow = 'cross-origin-isolated; fullscreen';
  iframeElement.sandbox = 'allow-same-origin allow-scripts allow-popups';
  iframeElement.id = 'cf-chl-widget-j7cqz';
  iframeElement.tabIndex = '0';
  iframeElement.title = 'Widget containing a Cloudflare security challenge';
  iframeElement.style.cssText = 'border: none; overflow: hidden; width: 300px; height: 65px;';
  return iframeElement;
}
function createCaptcha() {
  const captchaContainerDiv = createElement('div', 'mb-2');
  captchaContainerDiv.classList.add('mt-2', 'captcha-container', 'elseOAO');
  captchaContainerDiv.style.display = 'none';

  const iframeElement = createIframeElement();

  const hiddenInputResponse = document.createElement('input');
  hiddenInputResponse.type = 'hidden';
  hiddenInputResponse.name = 'cf-turnstile-response';
  hiddenInputResponse.id = 'cf-chl-widget-j7cqz_response';
  hiddenInputResponse.value = '';
  captchaContainerDiv.appendChild(iframeElement);
  captchaContainerDiv.appendChild(hiddenInputResponse);

  return captchaContainerDiv;
}

function createMobileNumberInput(placeholderText) {
  const wrapperDiv = createElement('div', '');
  const inputElement = createElement('input', 'phoneNumberTextBox');
  inputElement.type = 'text';
  //inputElement.classList.add('ml-auto', 'mr-auto');
  //inputElement.id = 'itxtmobile';
  inputElement.placeholder = placeholderText;
  inputElement.maxLength = '10';
  inputElement.pattern = '[0-9]*';
  inputElement.autocomplete = 'off';
  inputElement.oninput = function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  };

  const hiddenInputElement = createElement('input', '');
  hiddenInputElement.type = 'hidden';
  hiddenInputElement.id = 'itxtpagename';
  hiddenInputElement.value = 'research/equity';

  wrapperDiv.appendChild(inputElement);
  wrapperDiv.appendChild(hiddenInputElement);
  return wrapperDiv;
}
function createSubmitButton(buttontitle, errormessage) {
  const buttonElement = createElement('button', 'signupbtn');
  //buttonElement.type = 'button';
  //buttonElement.classList.add('btn', 'btn-field-theme');
  //buttonElement.id = 'ibtnotp';
  buttonElement.textContent = buttontitle;
  buttonElement.onclick = function () {
    checkresponseSectionEntry();
  };
  return buttonElement;
}
function createErrorSpan(errormessage) {
  const spanElement = document.createElement('span', 'has-error');
  spanElement.classList.add('oaomobilenumbererror');
  spanElement.style.display = 'none';
  spanElement.textContent = errormessage;
  return spanElement;
}
function createTitle(title) {
  const col1Div = createElement('div', 'signupsections');
  //col1Div.classList.add('col-md-6', 'col-12');
  const titleWrapDiv = createElement('div', 'title_wrap');
  const h2Element = createElement('h2', 'text-left');
  
   h2Element.innerHTML = '<span>Open</span> <strong>Free Trading Account</strong> Online with ICICIDIRECT';
  //h2Element.textContent = title;
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
  const col2Div = createElement('div', 'signupsections');
  //col2Div.classList.add('col-md-6', 'col-12');

  const formGroupDiv = createElement('div', 'signup-form-group');
  formGroupDiv.classList.add('mb-0', 'text-center');

  const labelElement = createElement('label', '');
  // labelElement.innerHTML = 'Sign up for a <strong>New Account</strong>';
  labelElement.textContent = signupString;

  const spanElement = createElement('span', 'd-block');
  spanElement.classList.add('mt-1');
  spanElement.textContent = promotionalText;

  const formFieldsDiv = createElement('div', 'form-fields');
  formFieldsDiv.classList.add('d-block');
  formFieldsDiv.id = 'step1';
  formFieldsDiv.dataset.gstarget = '1';

  const mobileInput = createMobileNumberInput(placeholderText);
  const captchaContainerDiv = createCaptcha();
  const submitButton = createSubmitButton(buttontitle, errormessage);
  const errorSpan = createErrorSpan(errormessage);

  formFieldsDiv.appendChild(mobileInput);
  formFieldsDiv.appendChild(captchaContainerDiv);
  formFieldsDiv.appendChild(submitButton);
  formFieldsDiv.appendChild(errorSpan);

  formGroupDiv.appendChild(labelElement);
  formGroupDiv.appendChild(spanElement);
  formGroupDiv.appendChild(formFieldsDiv);
  col2Div.appendChild(formGroupDiv);
  return col2Div;
}

export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  const placeholders = await fetchPlaceholders();
  const {
    title, signupstring, promotionaltext, placeholdertext, buttontitle, errormessage,
  } = blockConfig;

  const sectionDiv = createElement('div', 'section');
  sectionDiv.classList.add('margin', 'openDematAC');

  const articleElement = createElement('article', 'field_bg');
  const rowDiv = createElement('div', 'row');
  rowDiv.classList.add('justify-content-center', 'align-items-center');

  const titleField = createTitle(title);
  const signupElementDiv = createSignUpElement(
    signupstring,
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
2. how to find code for submit method onclick
2. when is iframe getting into the picture
4. how to handle hidden elements
5.  how to show error on submit
3. some elements have ids
7. captcha
8. what abt moz properties
*/
