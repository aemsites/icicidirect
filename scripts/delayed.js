// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './aem.js';
import { getEnvType } from './blocks-utils.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

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

loadScript('https://icici-securities.allincall.in/files/deploy/embed_chatbot_11.js?version=1.1');
loadScript('https://www.google.com/recaptcha/api.js?onload=onCaptchaloadCallback&render=explicit');

/**
 * Google Tag Manager
* */
async function loadGTM() {
  const scriptTag = document.createElement('script');
  scriptTag.innerHTML = `
        (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
            'gtm.start':
                new Date().getTime(), event: 'gtm.js'
        });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src =
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
        }(window, document, 'script', 'dataLayer', 'GTM-WF9LTLZ'));
    `;
  document.head.prepend(scriptTag);
}

loadScript('/scripts/cookie-script.js');

// TODO: Remove delayed loading of GTM once it stops impacting page performance
setTimeout(() => {
  loadGTM();
}, 2000);

(function loadAdobeLaunch() {
  const adobeLaunchSrc = {
    dev: 'https://assets.adobedtm.com/64c36731dbac/390f7bab5b74/launch-285ee83071cc-development.min.js',
    preview: 'https://assets.adobedtm.com/64c36731dbac/390f7bab5b74/launch-285ee83071cc-development.min.js',
    live: 'https://assets.adobedtm.com/64c36731dbac/390f7bab5b74/launch-285ee83071cc-development.min.js',
    prod: 'https://assets.adobedtm.com/64c36731dbac/390f7bab5b74/launch-285ee83071cc-development.min.js',
  };
  loadScript(adobeLaunchSrc[getEnvType()], { async: true });
}());
