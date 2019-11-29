/* eslint-disable func-names */
// https://developers.facebook.com/docs/apps/versions/
// https://developers.facebook.com/docs/javascript/quickstart/
// https://developers.facebook.com/docs/javascript/reference/FB.init/

/* global window, document */

export function initFbSdk(options) {
  return new Promise(resolve => {
    window.fbAsyncInit = function() {
      const defaults = { version: 'v3.1', cookie: true, xfbml: true };
      const moreOptions = { ...defaults, ...options };
      window.FB.init(moreOptions);
      resolve();
    };
    /* eslint-disable */
    (function(d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      const js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
    /* eslint-enable */
  });
}

export function getFbSdk(options) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    if (window.FB) {
      resolve(window.FB);
    } else {
      await initFbSdk(options);
      resolve(window.FB);
    }
  });
}

export function fbLogin(options) {
  return new Promise(resolve => window.FB.login(resolve, options));
}

export function getFbLoginStatus() {
  return new Promise(resolve => window.FB.getLoginStatus(resolve));
}

export function fbLogout() {
  return new Promise(resolve => window.FB.logout(resolve));
}
