import { get } from 'lodash';
import { serializeError } from 'serialize-error';
import axios from 'axios';

// eslint-disable-next-line import/no-cycle
import router from '@/router';
import User from '@/api/user';
import { compressImage } from '@/utils/general';

import {
  REGISTER_ACCOUNT_REQUEST,
  REGISTER_ACCOUNT_SUCCESS,
  REGISTER_ACCOUNT_FAIL,
  SIGN_IN_REQUEST,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAIL,
  RESEND_VERIFY_ACCOUNT_EMAIL_REQUEST,
  RESEND_VERIFY_ACCOUNT_EMAIL_SUCCESS,
  RESEND_VERIFY_ACCOUNT_EMAIL_FAIL,
  SIGN_OUT,
  SET_TOKEN_TO_REQUEST_HEADER,
  // SIGN_OUT_REQUEST,
  // SIGN_OUT_SUCCESS,
  // SIGN_OUT_FAIL,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAIL,
  GET_USER_PROFILE_REQUEST,
  GET_USER_PROFILE_SUCCESS,
  GET_USER_PROFILE_FAIL,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  UPDATE_AVATAR_REQUEST,
  UPDATE_AVATAR_SUCCESS,
  UPDATE_AVATAR_FAIL,
  LOGIN_WITH_SOCIAL_REQUEST,
  LOGIN_WITH_SOCIAL_SUCCESS,
  LOGIN_WITH_SOCIAL_FAIL,
  SEND_PASSWORD_RESET_CODE_REQUEST,
  SEND_PASSWORD_RESET_CODE_SUCCESS,
  SEND_PASSWORD_RESET_CODE_FAIL,
  VERIFY_PASSWORD_RESET_CODE_REQUEST,
  VERIFY_PASSWORD_RESET_CODE_SUCCESS,
  VERIFY_PASSWORD_RESET_CODE_FAIL,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
} from '../constants/mutationTypes';

const initState = {
  signUp: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
  signIn: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  signOut: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  profile: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  avatarUpdating: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  passwordUpdating: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  verifyEmail: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  passwordResetCodeSending: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  passwordResetCodeVerifying: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  passwordResetting: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
};

const actions = {
  async signUp({ commit }, params) {
    commit(REGISTER_ACCOUNT_REQUEST);
    try {
      const res = await User.registerAccount(params);
      const { data } = res;
      commit(REGISTER_ACCOUNT_SUCCESS, { data });
    } catch (error) {
      commit(REGISTER_ACCOUNT_FAIL, { error: serializeError(error) });
    }
  },

  async resendVerifyAccountEmail({ commit }, params) {
    commit(RESEND_VERIFY_ACCOUNT_EMAIL_REQUEST);
    try {
      const res = await User.resendVerifyAccountEmail(params);
      const { data } = res;
      commit(RESEND_VERIFY_ACCOUNT_EMAIL_SUCCESS, { data });
    } catch (error) {
      commit(RESEND_VERIFY_ACCOUNT_EMAIL_FAIL, { error: serializeError(error) });
    }
  },

  async loginWithSocial({ commit }, socialAuth) {
    commit(LOGIN_WITH_SOCIAL_REQUEST);
    try {
      const res = await User.loginWithSocial(socialAuth);
      const { data } = res;
      console.log('data', data);
      if (get(data, 'token')) {
        const { loginSource } = socialAuth;

        commit(LOGIN_WITH_SOCIAL_SUCCESS, { data: { ...data, loginSource } });
        commit(SET_TOKEN_TO_REQUEST_HEADER, { data });

        router.push(get(router, 'history.current.query.redirect', '/'));
      }
    } catch (error) {
      commit(LOGIN_WITH_SOCIAL_FAIL, { error: serializeError(error) });
    }
  },

  async signIn({ commit }, params) {
    commit(SIGN_IN_REQUEST);
    try {
      const res = await User.signIn(params);
      const { data } = res;
      if (get(data, 'token')) {
        commit(SIGN_IN_SUCCESS, { data });
        commit(SET_TOKEN_TO_REQUEST_HEADER, { data });
        router.push(get(router, 'history.current.query.redirect', '/'));
      }
    } catch (error) {
      commit(SIGN_IN_FAIL, { error: serializeError(error) });
    }
  },

  async changePassword({ commit }, passwordData) {
    commit(CHANGE_PASSWORD_REQUEST);
    try {
      const res = await User.changePassword(passwordData);
      const { data } = res;
      commit(CHANGE_PASSWORD_SUCCESS, { data });
    } catch (error) {
      commit(CHANGE_PASSWORD_FAIL, { error: serializeError(error) });
    }
  },

  async getUserProfile({ commit }, params) {
    commit(GET_USER_PROFILE_REQUEST);
    try {
      const res = await User.getUserProfile(params);
      const { data } = res;
      commit(GET_USER_PROFILE_SUCCESS, { data });
    } catch (error) {
      console.log(serializeError(error));
      commit(GET_USER_PROFILE_FAIL, { error: serializeError(error) });
    }
  },

  async updateProfile({ commit }, userId) {
    commit(UPDATE_PROFILE_REQUEST);
    try {
      const res = await User.setUserProfile(userId);
      const { data } = res;
      commit(UPDATE_PROFILE_SUCCESS, { data });
    } catch (error) {
      console.log(serializeError(error));
      commit(UPDATE_PROFILE_FAIL, { error: serializeError(error) });
    }
  },

  async updateAvatar({ commit }, file) {
    commit(UPDATE_AVATAR_REQUEST);
    try {
      const formData = new FormData();
      const image = await compressImage(file);
      formData.append('avatar', image);

      const res = await User.setUserAvatar(formData);
      const { data } = res;
      commit(UPDATE_AVATAR_SUCCESS, { data });
    } catch (error) {
      console.log(serializeError(error));
      commit(UPDATE_AVATAR_FAIL, { error: serializeError(error) });
    }
  },

  // async signOut({ state, commit }) {
  //   commit(SIGN_OUT_REQUEST);
  //   try {
  //     const res = await User.signOut();
  //     const { data } = res;
  //     commit(SIGN_OUT_SUCCESS, { data });
  //     router.push('/login');
  //   } catch (error) {
  //     commit(SIGN_OUT_FAIL, { error: serializeError(error) });
  //     router.push('/login');
  //   }
  // },

  async sendPasswordResetCode({ commit }, pramas) {
    commit(SEND_PASSWORD_RESET_CODE_REQUEST);
    try {
      const res = await User.sendPasswordResetCode(pramas);
      const { data } = res;
      commit(SEND_PASSWORD_RESET_CODE_SUCCESS, { data });
    } catch (error) {
      console.log(serializeError(error));
      commit(SEND_PASSWORD_RESET_CODE_FAIL, { error: serializeError(error) });
    }
  },

  async verifyPasswordResetCode({ commit }, pramas) {
    commit(VERIFY_PASSWORD_RESET_CODE_REQUEST);
    try {
      const res = await User.verifyPasswordResetCode(pramas);
      const { data } = res;
      commit(VERIFY_PASSWORD_RESET_CODE_SUCCESS, { data });
    } catch (error) {
      console.log(serializeError(error));
      commit(VERIFY_PASSWORD_RESET_CODE_FAIL, { error: serializeError(error) });
    }
  },

  async resetPassword({ commit }, pramas) {
    commit(RESET_PASSWORD_REQUEST);
    try {
      const res = await User.resetPassword(pramas);
      const { data } = res;
      commit(RESET_PASSWORD_SUCCESS, { data });
    } catch (error) {
      console.log(serializeError(error));
      commit(RESET_PASSWORD_FAIL, { error: serializeError(error) });
    }
  },

  signOut({ commit }) {
    commit(SIGN_OUT);
    router.go('/login');
  },
};

const mutations = {
  [REGISTER_ACCOUNT_REQUEST](state) {
    state.signUp.requesting = true;
    state.signUp.status = '';
  },
  [REGISTER_ACCOUNT_SUCCESS](state, payload) {
    state.signUp.requesting = false;
    state.signUp.status = 'success';
    state.signUp.result = payload.data;
    state.signIn.result = {
      ...state.signIn.result,
      ...payload.data,
    };
  },
  [REGISTER_ACCOUNT_FAIL](state, payload) {
    state.signUp.requesting = false;
    state.signUp.status = 'error';
    state.signUp.error = payload.error;
  },
  [SIGN_IN_REQUEST](state) {
    state.signIn.requesting = true;
    state.signIn.status = '';
  },
  [SIGN_IN_SUCCESS](state, payload) {
    state.signIn.requesting = false;
    state.signIn.status = 'success';
    state.signIn.result = payload.data;
  },
  [SIGN_IN_FAIL](state, payload) {
    state.signIn.requesting = false;
    state.signIn.status = 'error';
    state.signIn.error = payload.error;
  },
  [RESEND_VERIFY_ACCOUNT_EMAIL_REQUEST](state) {
    state.verifyEmail.requesting = true;
    state.verifyEmail.status = '';
  },
  [RESEND_VERIFY_ACCOUNT_EMAIL_SUCCESS](state, payload) {
    state.verifyEmail.requesting = false;
    state.verifyEmail.status = 'success';
    state.verifyEmail.result = payload.data;
  },
  [RESEND_VERIFY_ACCOUNT_EMAIL_FAIL](state, payload) {
    state.verifyEmail.requesting = false;
    state.verifyEmail.status = 'error';
    state.verifyEmail.error = payload.error;
  },
  [CHANGE_PASSWORD_REQUEST](state) {
    state.passwordUpdating.requesting = true;
    state.passwordUpdating.status = '';
  },
  [CHANGE_PASSWORD_SUCCESS](state, payload) {
    state.passwordUpdating.requesting = false;
    state.passwordUpdating.status = 'success';
    state.passwordUpdating.result = payload.data;
  },
  [CHANGE_PASSWORD_FAIL](state, payload) {
    state.passwordUpdating.requesting = false;
    state.passwordUpdating.status = 'error';
    state.passwordUpdating.error = payload.error;
  },
  [LOGIN_WITH_SOCIAL_REQUEST](state) {
    state.signIn.requesting = true;
    state.signIn.status = '';
  },
  [LOGIN_WITH_SOCIAL_SUCCESS](state, payload) {
    state.signIn.requesting = false;
    state.signIn.status = 'success';
    state.signIn.result = payload.data;
  },
  [LOGIN_WITH_SOCIAL_FAIL](state, payload) {
    state.signIn.requesting = false;
    state.signIn.status = 'error';
    state.signIn.error = payload.error;
  },
  [GET_USER_PROFILE_REQUEST](state) {
    state.profile.requesting = true;
    state.profile.status = '';
  },
  [GET_USER_PROFILE_SUCCESS](state, payload) {
    state.profile.requesting = false;
    state.profile.status = 'success';
    state.profile.result = payload.data;
  },
  [GET_USER_PROFILE_FAIL](state, payload) {
    state.profile.requesting = false;
    state.profile.status = 'error';
    state.profile.error = payload.error;
  },
  [UPDATE_PROFILE_REQUEST](state) {
    state.profile.requesting = true;
    state.profile.status = '';
  },
  [UPDATE_PROFILE_SUCCESS](state, payload) {
    state.profile.requesting = false;
    state.profile.status = 'success';
    state.profile.result = payload.data;
  },
  [UPDATE_PROFILE_FAIL](state, payload) {
    state.profile.requesting = false;
    state.profile.status = 'error';
    state.profile.error = payload.error;
  },
  [UPDATE_AVATAR_REQUEST](state) {
    state.avatarUpdating.requesting = true;
    state.avatarUpdating.status = '';
  },
  [UPDATE_AVATAR_SUCCESS](state, payload) {
    state.avatarUpdating.requesting = false;
    state.avatarUpdating.status = 'success';
    state.avatarUpdating.result = payload.data;
    state.profile.result = payload.data;
  },
  [UPDATE_AVATAR_FAIL](state, payload) {
    state.avatarUpdating.requesting = false;
    state.avatarUpdating.status = 'error';
    state.avatarUpdating.error = payload.error;
  },
  [SEND_PASSWORD_RESET_CODE_REQUEST](state) {
    state.passwordResetCodeSending.requesting = true;
    state.passwordResetCodeSending.status = '';
  },
  [SEND_PASSWORD_RESET_CODE_SUCCESS](state, payload) {
    state.passwordResetCodeSending.requesting = false;
    state.passwordResetCodeSending.status = 'success';
    state.passwordResetCodeSending.result = payload.data;
  },
  [SEND_PASSWORD_RESET_CODE_FAIL](state, payload) {
    state.passwordResetCodeSending.requesting = false;
    state.passwordResetCodeSending.status = 'error';
    state.passwordResetCodeSending.error = payload.error;
  },
  [VERIFY_PASSWORD_RESET_CODE_REQUEST](state) {
    state.passwordResetCodeVerifying.requesting = true;
    state.passwordResetCodeVerifying.status = '';
  },
  [VERIFY_PASSWORD_RESET_CODE_SUCCESS](state, payload) {
    state.passwordResetCodeVerifying.requesting = false;
    state.passwordResetCodeVerifying.status = 'success';
    state.passwordResetCodeVerifying.result = payload.data;
  },
  [VERIFY_PASSWORD_RESET_CODE_FAIL](state, payload) {
    state.passwordResetCodeVerifying.requesting = false;
    state.passwordResetCodeVerifying.status = 'error';
    state.passwordResetCodeVerifying.error = payload.error;
  },
  [RESET_PASSWORD_REQUEST](state) {
    state.passwordResetting.requesting = true;
    state.passwordResetting.status = '';
  },
  [RESET_PASSWORD_SUCCESS](state, payload) {
    state.passwordResetting.requesting = false;
    state.passwordResetting.status = 'success';
    state.passwordResetting.result = payload.data;
  },
  [RESET_PASSWORD_FAIL](state, payload) {
    state.passwordResetting.requesting = false;
    state.passwordResetting.status = 'error';
    state.passwordResetting.error = payload.error;
  },
  // [SIGN_OUT_REQUEST](state) {
  //   state.signOut.requesting = true;
  //   state.signOut.status = '';
  // },
  // [SIGN_OUT_SUCCESS](state, payload) {
  //   state.signOut.requesting = false;
  //   state.signOut.status = 'success';
  //   state.signOut.result = payload.data;
  //   state.signIn.result = null;
  // },
  // [SIGN_OUT_FAIL](state, payload) {
  //   state.signOut.requesting = false;
  //   state.signOut.status = 'error';
  //   state.signOut.error = payload.error;
  //   state.signIn.result = null;
  // },
  [SIGN_OUT](state) {
    state.signIn.result = {};
  },
  [SET_TOKEN_TO_REQUEST_HEADER](state, payload) {
    const token = get(payload, 'data.token');
    const authenType = get(payload, 'data.type');
    if (token) {
      axios.defaults.headers.common.Authorization = `${authenType} ${token}`;
    }
  },
};

const getters = {
  currentUser: state => get(state, 'signIn.result'),
  userProfile: state => get(state, 'profile.result'),
};

export default {
  state: initState,
  actions,
  mutations,
  getters,
};
