import { callMockBlogAPI } from '../../scripts/mockapi.js';
import { decorateIcons, fetchPlaceholders, readBlockConfig } from '../../scripts/aem.js';
import { createElement, observe } from '../../scripts/blocks-utils.js';



export default async function decorate(block) {
  const blockConfig = readBlockConfig(block);
  var sectionDiv = createElement('div','section');
  sectionDiv.classList.add( 'margin', 'openDematAC');

  var articleElement = createElement('article','field_bg');


  // Create the div with class "row justify-content-center align-items-center"
  var rowDiv = createElement('div','row');
  rowDiv.classList.add( 'justify-content-center', 'align-items-center');
  
  // Create the first column div
  var col1Div = createElement('div','col-lg-5');
  col1Div.classList.add('col-md-6', 'col-12');
  
  // Create the title wrap div
  var titleWrapDiv = createElement('div','title_wrap');
  
  // Create the h2 element with class "sec_title text-left hindiclassheading"
  var h2Element = createElement('h2','sec_title');
  h2Element.classList.add('text-left', 'hindiclassheading');
  h2Element.innerHTML = '<span>Open</span> <strong>Free Trading Account</strong> Online with ICICIDIRECT';
  // Append the h2 element to the title wrap div
titleWrapDiv.appendChild(h2Element);

// Append the title wrap div to the first column div
col1Div.appendChild(titleWrapDiv);

// Create the second column div
var col2Div = createElement('div','col-lg-5');
col2Div.classList.add('col-md-6', 'col-12');

// Create the form group div with class "form-group mb-0 text-center"
var formGroupDiv = createElement('div','form-group');
formGroupDiv.classList.add('mb-0', 'text-center');

// Create the label with class "hindiclasslabel"
var labelElement = createElement('label','hindiclasslabel');
labelElement.innerHTML = 'Sign up for a <strong>New Account</strong>';

// Create the span element with style "color: #333;"
var spanElement = createElement('span','d-block');
spanElement.classList.add( 'mt-1');
spanElement.style.color = '#333';
spanElement.textContent = "Incur '0' Brokerage upto ₹500";

// Create the div with class "form-fields d-block" and id "step1"
var formFieldsDiv = createElement('div','form-fields');
formFieldsDiv.classList.add( 'd-block');
formFieldsDiv.id = 'step1';
formFieldsDiv.dataset.gstarget = '1';

// Create the input element with type "text" and class "form-control ml-auto mr-auto" and other attributes
var inputElement = createElement('input','');
inputElement.type = 'text';
inputElement.classList.add('form-control', 'ml-auto', 'mr-auto');
inputElement.id = 'itxtmobile';
inputElement.placeholder = 'Enter Your Mobile Number';
inputElement.maxLength = '10';
inputElement.pattern = '[0-9]*';
inputElement.autocomplete = 'off';
inputElement.oninput = function() {
    this.value = this.value.replace(/[^0-9]/g,'');
};

// Create the input element with type "hidden" and id "itxtpagename"
var hiddenInputElement = createElement('input','');
hiddenInputElement.type = 'hidden';
hiddenInputElement.id = 'itxtpagename';
hiddenInputElement.value = 'research/equity';

// Create the div with class "mb-2 mt-2 captcha-container elseOAO" and style "display: none;"
var captchaContainerDiv = createElement('div','mb-2');
captchaContainerDiv.classList.add( 'mt-2', 'captcha-container', 'elseOAO');
captchaContainerDiv.style.display = 'none';

// Create the iframe element with src and other attributes
var iframeElement = document.createElement('iframe');
iframeElement.src = 'https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/if/ov2/av0/rcv0/0/j7cqz/0x4AAAAAAAK3iakV3QAmUWAf/auto/normal';
iframeElement.allow = 'cross-origin-isolated; fullscreen';
iframeElement.sandbox = 'allow-same-origin allow-scripts allow-popups';
iframeElement.id = 'cf-chl-widget-j7cqz';
iframeElement.tabIndex = '0';
iframeElement.title = 'Widget containing a Cloudflare security challenge';
iframeElement.style.cssText = 'border: none; overflow: hidden; width: 300px; height: 65px;';

// Create the input element with type "hidden" and name "cf-turnstile-response" and id "cf-chl-widget-j7cqz_response"
var hiddenInputResponse = document.createElement('input');
hiddenInputResponse.type = 'hidden';
hiddenInputResponse.name = 'cf-turnstile-response';
hiddenInputResponse.id = 'cf-chl-widget-j7cqz_response';
hiddenInputResponse.value = '';

// Create the button element with type "button" and class "btn btn-field-theme" and other attributes
var buttonElement = createElement('button','');
buttonElement.type = 'button';
buttonElement.classList.add('btn', 'btn-field-theme');
buttonElement.id = 'ibtnotp';
buttonElement.textContent = 'SUBMIT';
buttonElement.onclick = function() {
    checkresponseSectionEntry();
};

// Append the elements to their respective parents
formFieldsDiv.appendChild(inputElement);
formFieldsDiv.appendChild(hiddenInputElement);
formFieldsDiv.appendChild(captchaContainerDiv);
formFieldsDiv.appendChild(buttonElement);
formGroupDiv.appendChild(labelElement);
formGroupDiv.appendChild(spanElement);
formGroupDiv.appendChild(formFieldsDiv);
formGroupDiv.appendChild(hiddenInputResponse);
col2Div.appendChild(formGroupDiv);
rowDiv.appendChild(col1Div);
rowDiv.appendChild(col2Div);
  articleElement.appendChild(rowDiv);
  sectionDiv.appendChild(articleElement);
  block.textContent = '';
  block.appendChild(sectionDiv);
}
