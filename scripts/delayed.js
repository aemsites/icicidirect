// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './aem.js';
import {
  // eslint-disable-next-line import/named
  loadGTM, loadAdobeLaunch, loadAnalyticsEager, loadAnalyticsDelayed,
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
  if (!loadAnalyticsEager() && loadAnalyticsDelayed() === -1) {
    // TODO: Remove delayed loading of GTM once it stops impacting page performance
    setTimeout(() => {
      loadGTM();
    }, 2000);

    loadAdobeLaunch();
  }
  loadScript('https://icici-securities.allincall.in/files/deploy/embed_chatbot_11.js?version=1.1');
}
