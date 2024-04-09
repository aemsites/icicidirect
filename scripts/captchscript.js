if (typeof grecaptcha === 'undefined') {
  grecaptcha = {};
}
grecaptcha.ready = function (cb) {
  if (typeof grecaptcha === 'undefined') {
    // window.__grecaptcha_cfg is a global variable that stores reCAPTCHA's
    // configuration. By default, any functions listed in its 'fns' property
    // are automatically executed when reCAPTCHA loads.
    const c = '___grecaptcha_cfg';
    window[c] = window[c] || {};
    (window[c].fns = window[c].fns || []).push(cb);
  } else {
    cb();
  }
};

// Usage
// eslint-disable-next-line no-undef
grecaptcha.ready(() => {
    console.log("I am here");
  // eslint-disable-next-line no-undef
  grecaptcha.render('container', {
    sitekey: '6LfrHrQpAAAAAMuD8qoz9J95kTu2I78Gv5HKuQh-',
  });
});
