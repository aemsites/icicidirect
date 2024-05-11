// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './aem.js';
import {
  // eslint-disable-next-line import/named
  defaultAnalyticsLoadDisabled,
} from './blocks-utils.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

const isSidekickLibrary = (window.location.pathname.includes('srcdoc'));

const onCaptchaloadCallback = () => {
  document.querySelectorAll('.g-recaptcha').forEach((el) => {
    // eslint-disable-next-line no-undef
    grecaptcha.render(el, {
      sitekey: '6LfrHrQpAAAAAMuD8qoz9J95kTu2I78Gv5HKuQh-', // TODO: Replace with actual sitekey
      callback(token) {
        window.validateCaptchaToken = token;
      },
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
    // loadAdobeLaunchAndGTM();
  }
  loadScript('https://icici-securities.allincall.in/files/deploy/embed_chatbot_11.js?version=1.1');
}
