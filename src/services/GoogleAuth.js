export const initGoogleAuth = params => new Promise(resolve => {
  window.gapi.load('auth2', () => {
    const auth2 = window.gapi.auth2.init(params);
    resolve(auth2);
  });
});
