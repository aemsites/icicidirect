// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

loadScript('https://icici-securities.allincall.in/files/deploy/embed_chatbot_11.js?version=1.1');
loadScript('/scripts/cookie-script.js');
loadScript('https://assets.adobedtm.com/64c36731dbac/390f7bab5b74/launch-285ee83071cc-development.min.js', { async: true });

(function gtm(w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });
  const f = d.getElementsByTagName(s)[0];
  const j = d.createElement(s);
  const dl = l !== 'dataLayer' ? `&l=${l}` : '';
  j.async = true;
  j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
  f.parentNode.insertBefore(j, f);
}(window, document, 'script', 'dataLayer', 'GTM-WF9LTLZ'));

(function loadTagManagerElement() {
  const htmlContent = '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WF9LTLZ"\n'
      + 'height="0" width="0" style="display:none;visibility:hidden"></iframe>';
  const scriptElement = document.createElement('noscript');
  scriptElement.innerHTML = htmlContent;
  const { body } = document;
  body.insertBefore(scriptElement, body.firstChild);
}());
