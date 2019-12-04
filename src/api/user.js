import http from '../services/http';

export default class User {
  static registerAccount(body, config) {
    return http.post('/users/create', body, config);
  }

  static signIn(body, config) {
    return http.post('/users/sign-in', body, config);
  }

  static resendVerifyAccountEmail(body, config) {
    return http.post('/users/resend-account-activation-email', body, config);
  }

  static sendPasswordResetCode(body, config) {
    return http.post('/users/send-password-reset-code', body, config);
  }

  static verifyPasswordResetCode(body, config) {
    return http.post('users/verify-password-reset-code', body, config);
  }

  static resetPassword(body, config) {
    return http.post('users/reset-password', body, config);
  }

  static changePassword(body, config) {
    return http.post('/users/change-password', body, config);
  }

  static loginWithSocial(body, config) {
    return http.post('/users/login-with-social', body, config);
  }

  static signOut(config) {
    return http.get('/users/sign-out', config);
  }

  static getUserProfile(id, config) {
    return http.get(`/users/profile/${id}`, config);
  }

  static setUserProfile(body, config) {
    return http.post('/users/set-user-profile', body, config);
  }

  static setUserAvatar(body, config) {
    return http.post('/users/set-user-avatar', body, config);
  }
}
