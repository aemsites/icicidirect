// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './aem.js';
import { getEnvType } from './blocks-utils.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// This function is called when the Turnstile script is loaded and ready to be used.
// The function name matches the "onload=..." parameter.
// eslint-disable-next-line no-unused-vars
function turnstileCb() {
  document.querySelectorAll('.turnstile-container').forEach((el) => {
    // eslint-disable-next-line no-undef
    turnstile.render(el, {
      sitekey: '0x4AAAAAAAVrq_k7QabpK5gM', // TODO: Replace with actual sitekey
      theme: 'light',
      callback(token) {
        window.validateuserToken = token;
      },
    });
  });
}

window.turnstileCb = turnstileCb;

if (getEnvType() !== 'dev') {
  await loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js?onload=turnstileCb');
}

loadScript('https://icici-securities.allincall.in/files/deploy/embed_chatbot_11.js?version=1.1');
