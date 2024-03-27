// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './aem.js';

function includeExternalScripts() {
  document.createElement('d');
  const scripts = [
    'https://icici-securities.allincall.in/files/deploy/embed_chatbot_11.js?version=1.1',
    'https://bat.bing.com/p/insights/s/0.7.24',
    'https://bat.bing.com/p/insights/t/20131149',
    'https://bat.bing.com/p/action/20131149.js',
    'https://bat.bing.com/bat.js',
    'https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.0/socket.io.min.js',
    'https://snap.licdn.com/li.lms-analytics/insight.min.js',
    'https://static.ads-twitter.com/uwt.js',
    'https://a.quora.com/qevents.js',
    'https://www.googletagmanager.com/gtag/destination?id=AW-978034268&l=dataLayer&cx=c',
    'https://www.google-analytics.com/analytics.js',
    'https://www.googletagmanager.com/gtag/js?id=G-2KB04WCCC2&l=dataLayer&cx=c',
    'https://www.googletagmanager.com/gtm.js?id=GTM-WF9LTLZ',
  ];

  scripts.forEach((script) => {
    loadScript(script);
  });
  // Create a new div element
  const bingdiv = document.createElement('div');

  // Create a new img element
  const img = document.createElement('img');

  // Set attributes for the img element
  img.setAttribute('id', 'batBeacon42283856747');
  img.setAttribute('width', '0');
  img.setAttribute('height', '0');
  img.setAttribute('alt', '');
  img.setAttribute('src', 'https://bat.bing.com/action/0?ti=20131149&amp;tm=gtm002&amp;Ver=2&amp;mid=354fa5f9-ca7f-4f18-9cdd-806a73b03b1e&amp;sid=89f10060eb3411ee88915ff977266d91&amp;vid=cb7c5cb0293a11ee81982d50267aae77&amp;vids=0&amp;msclkid=N&amp;pi=918639831&amp;lg=en-GB&amp;sw=1920&amp;sh=1080&amp;sc=24&amp;tl=Equity%20Research%20%26%20Analysis%20for%20Smooth%20Equity%20Trading%20%7C%20ICICI%20Direct&amp;p=https%3A%2F%2Fwww.icicidirect.com%2Fresearch%2Fequity&amp;r=&amp;lt=7571&amp;evt=pageLoad&amp;sv=1&amp;rn=767940');
  img.setAttribute('style', 'width: 0px; height: 0px; display: none; visibility: hidden;');

  // Append the img element to the div
  bingdiv.appendChild(img);

  // Append the div to the document body
  document.body.appendChild(bingdiv);
}

// Core Web Vitals RUM collection
sampleRUM('cwv');

// loadScript();

includeExternalScripts();
