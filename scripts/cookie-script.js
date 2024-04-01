/* eslint-disable */
(function (document) {
  const { referrer } = document;
  let gaReferral = {
    utmcsr: '(direct)',
    utmcmd: '(none)',
    utmccn: '(not set)',
  };
  const thisHostname = document.location.hostname;
  // eslint-disable-next-line no-use-before-define
  const thisDomain = getDomain_(thisHostname);
  // eslint-disable-next-line no-use-before-define
  let referringDomain = getDomain_(document.referrer);
  // eslint-disable-next-line no-use-before-define
  const sessionCookie = getCookie_('__utmzzses');
  const cookieExpiration = '';
  const qs = document.location.search.replace('?', '');
  const hash = document.location.hash.replace('#', '');
  // eslint-disable-next-line no-use-before-define
  let gaParams = parseGoogleParams(`${qs}#${hash}`);
  // eslint-disable-next-line no-use-before-define
  let referringInfo = parseGaReferrer(referrer);
  // eslint-disable-next-line no-use-before-define
  const storedVals = getCookie_('__utmz') || getCookie_('__utmzz');
  const newCookieVals = [];
  const keyMap = {
    utm_source: 'utmcsr',
    utm_medium: 'utmcmd',
    utm_campaign: 'utmccn',
    utm_content: 'utmcct',
    utm_term: 'utmctr',
    gclid: 'utmgclid',
    dclid: 'utmdclid',
  };

  const keyFilter = ['utmcsr', 'utmcmd', 'utmccn', 'utmcct', 'utmctr'];
  let keyName;
  let values;
  let _val;
  let _key;
  let raw;
  let key;
  let len;
  let i;

  if (sessionCookie && referringDomain === thisDomain) {
    gaParams = null;
    referringInfo = null;
  }

  if (gaParams && (gaParams.utm_source || gaParams.gclid || gaParams.dclid)) {
    for (key in gaParams) {
      if (typeof gaParams[key] !== 'undefined') {
        keyName = keyMap[key];
        gaReferral[keyName] = gaParams[key];
      }
    }

    if ((gaParams.gclid || gaParams.dclid) && gaParams.utm_source == undefined) {
      gaReferral.utmcsr = 'google';
      gaReferral.utmcmd = gaReferral.utmgclid ? 'cpc' : 'cpm';
    }
  } else if (referringInfo) {
    gaReferral.utmcsr = referringInfo.source;
    gaReferral.utmcmd = referringInfo.medium;
    if (referringInfo.term) gaReferral.utmctr = referringInfo.term;
  } else if (storedVals) {
    values = {};
    raw = storedVals.split('|');
    len = raw.length;

    for (i = 0; i < len; i++) {
      _val = raw[i].split('=');
      _key = _val[0].split('.').pop();
      values[_key] = _val[1];
    }

    gaReferral = values;
  }

    // eslint-disable-next-line no-restricted-syntax
  for (key in gaReferral) {
    if (typeof gaReferral[key] !== 'undefined' && keyFilter.indexOf(key) > -1) {
      newCookieVals.push(`${key}=${gaReferral[key]}`);
    }
  }

    // eslint-disable-next-line no-use-before-define
  if (!getCookie_('initialTrafficSource')) {
      // eslint-disable-next-line no-use-before-define
    writeCookie_('initialTrafficSource', newCookieVals.join('|'), cookieExpiration, '/', thisDomain);
  }

  writeCookie_('__utmzzses', 1, null, '/', thisDomain);

  function parseGoogleParams(str) {
    const campaignParams = ['source', 'medium', 'campaign', 'term', 'content'];
    const regex = new RegExp(`(utm_(${campaignParams.join('|')})|(d|g)clid)=.*?([^&#]*|$)`, 'gi');
    const gaParams = str.match(regex);
    let paramsObj;
    let vals;
    let len;
    let i;

    if (gaParams) {
      paramsObj = {};
      len = gaParams.length;

      for (i = 0; i < len; i++) {
        vals = gaParams[i].split('=');

        if (vals) {
          paramsObj[vals[0]] = vals[1];
        }
      }
    }

    return paramsObj;
  }

  function parseGaReferrer(referrer) {
    if (!referrer) return;

    const searchEngines = {
      'daum.net': {
        p: 'q',
        n: 'daum',
      },
      'eniro.se': {
        p: 'search_word',
        n: 'eniro ',
      },
      'naver.com': {
        p: 'query',
        n: 'naver ',
      },
      'yahoo.com': {
        p: 'p',
        n: 'yahoo',
      },
      'msn.com': {
        p: 'q',
        n: 'msn',
      },
      'bing.com': {
        p: 'q',
        n: 'live',
      },
      'aol.com': {
        p: 'q',
        n: 'aol',
      },
      'lycos.com': {
        p: 'q',
        n: 'lycos',
      },
      'ask.com': {
        p: 'q',
        n: 'ask',
      },
      'altavista.com': {
        p: 'q',
        n: 'altavista',
      },
      'search.netscape.com': {
        p: 'query',
        n: 'netscape',
      },
      'cnn.com': {
        p: 'query',
        n: 'cnn',
      },
      'about.com': {
        p: 'terms',
        n: 'about',
      },
      'mamma.com': {
        p: 'query',
        n: 'mama',
      },
      'alltheweb.com': {
        p: 'q',
        n: 'alltheweb',
      },
      'voila.fr': {
        p: 'rdata',
        n: 'voila',
      },
      'search.virgilio.it': {
        p: 'qs',
        n: 'virgilio',
      },
      'baidu.com': {
        p: 'wd',
        n: 'baidu',
      },
      'alice.com': {
        p: 'qs',
        n: 'alice',
      },
      'yandex.com': {
        p: 'text',
        n: 'yandex',
      },
      'najdi.org.mk': {
        p: 'q',
        n: 'najdi',
      },
      'seznam.cz': {
        p: 'q',
        n: 'seznam',
      },
      'search.com': {
        p: 'q',
        n: 'search',
      },
      'wp.pl': {
        p: 'szukaj ',
        n: 'wirtulana polska',
      },
      'online.onetcenter.org': {
        p: 'qt',
        n: 'o*net',
      },
      'szukacz.pl': {
        p: 'q',
        n: 'szukacz',
      },
      'yam.com': {
        p: 'k',
        n: 'yam',
      },
      'pchome.com': {
        p: 'q',
        n: 'pchome',
      },
      'kvasir.no': {
        p: 'q',
        n: 'kvasir',
      },
      'sesam.no': {
        p: 'q',
        n: 'sesam',
      },
      'ozu.es': {
        p: 'q',
        n: 'ozu ',
      },
      'terra.com': {
        p: 'query',
        n: 'terra',
      },
      'mynet.com': {
        p: 'q',
        n: 'mynet',
      },
      'ekolay.net': {
        p: 'q',
        n: 'ekolay',
      },
      'rambler.ru': {
        p: 'words',
        n: 'rambler',
      },
      google: {
        p: 'q',
        n: 'google',
      },
    };
    const a = document.createElement('a');
    const values = {};
    let searchEngine;
    let termRegex;
    let term;

    a.href = referrer;

    // Shim for the billion google search engines
    if (a.hostname.indexOf('google') > -1) {
      referringDomain = 'google';
    }

    if (searchEngines[referringDomain]) {
      searchEngine = searchEngines[referringDomain];
      termRegex = new RegExp(`${searchEngine.p}=.*?([^&#]*|$)`, 'gi');
      term = a.search.match(termRegex);

      values.source = searchEngine.n;
      values.medium = 'organic';

      values.term = (term ? term[0].split('=')[1] : '') || '(not provided)';
    } else if (referringDomain !== thisDomain) {
      values.source = a.hostname;
      values.medium = 'referral';
    }

    return values;
  }

  function writeCookie_(name, value, expiration, path, domain) {
    let str = `${name}=${value};`;
    if (expiration) str += 'Expires="0"' + ';';
    if (path) str += `Path=${path};`;
    if (domain) str += `Domain=${domain};`;

    document.cookie = str;
  }

  function getCookie_(name) {
    const cookies = `; ${document.cookie}`;
    const cvals = cookies.split(`; ${name}=`);

    if (cvals.length > 1) return cvals.pop().split(';')[0];
  }

  // eslint-disable-next-line no-underscore-dangle
  function getDomain_(url) {
    if (!url) return;

    const a = document.createElement('a');
    a.href = url;

    try {
      // eslint-disable-next-line consistent-return
      return a.hostname.match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/)[0];
    } catch (squelch) { /* empty */ }
  }
}(document));
