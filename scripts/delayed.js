// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './aem.js';

function includeExternalScripts() {
  const scripts = [
    'https://icici-securities.allincall.in/files/deploy/embed_chatbot_11.js?version=1.1',
    'https://bat.bing.com/p/insights/s/0.7.24',
    'https://bat.bing.com/p/insights/t/20131149',
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
}

// Core Web Vitals RUM collection
sampleRUM('cwv');

// loadScript();

includeExternalScripts();
