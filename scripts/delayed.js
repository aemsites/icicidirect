// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM, fetchPlaceholders } from './aem.js';
import {
  // eslint-disable-next-line import/named
  defaultAnalyticsLoadDisabled,
  loadAdobeLaunchAndGTM,
  buildHowToSchema,
} from './blocks-utils.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

buildHowToSchema();

const isSidekickLibrary = (window.location.pathname.includes('srcdoc'));

const onCaptchaloadCallback = () => {
  document.querySelectorAll('.g-recaptcha').forEach((el) => {
    fetchPlaceholders().then((placeholders) => {
      // eslint-disable-next-line no-undef
      grecaptcha.render(el, {
        sitekey: placeholders.sitekey, // Use sitekey from placeholders
        callback(token) {
          window.validateCaptchaToken = token;
        },
      });
    });
  });
};

window.onCaptchaloadCallback = onCaptchaloadCallback;

loadScript('https://www.google.com/recaptcha/api.js?onload=onCaptchaloadCallback&render=explicit');

/**
 * Google Tag Manager
* */

loadScript('/scripts/cookie-script.js');

if (!isSidekickLibrary) {
  if (!defaultAnalyticsLoadDisabled()) {
    loadAdobeLaunchAndGTM();
  }
  // Needed for chatbot to work in non-prod environments
  loadScript('/scripts/mockxmlhttprequest.js', { type: 'module' });
  loadScript('https://icici-securities.allincall.in/files/deploy/embed_chatbot_11.js?version=1.1');
}
