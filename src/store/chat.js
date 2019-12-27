import { get, set, cloneDeep } from 'lodash';
import { serializeError } from 'serialize-error';

// eslint-disable-next-line import/no-cycle
import Chat from '../api/chat';

import {
  GET_MESSAGE_REQUEST,
  GET_MESSAGE_SUCCESS,
  GET_MESSAGE_FAIL,
  SEND_MESSAGE,
  RECEIVE_MESSAGE
} from '../constants/mutationTypes';

const initState = {
  message: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
};

const actions = {
  async getMessageByConversation({ commit }, { page }) {
    commit(GET_MESSAGE_REQUEST);
    try {
      const res = await Chat.getMessageByConversation(3, {
        limit: 100,
        page,
      });
      const { data } = res;
      const cookData = {
        ...data,
        data: get(data, 'data', []).map(item => ({
          message: get(item, 'content'),
          userId: get(item, 'userId'),
          createdAt: get(item, 'createdAt'),
          username: get(item, 'username'),
          avatarUrl: get(item, 'user.profile.avatarUrl'),
        })),
      };
      commit(GET_MESSAGE_SUCCESS, cookData);
    } catch (error) {
      commit(GET_MESSAGE_FAIL, { error: serializeError(error) });
    }
  },

  sendMessage({ commit }, message) {
    commit(SEND_MESSAGE, message);
  },

  receiveMessage({ commit }, message) {
    commit(RECEIVE_MESSAGE, message);
  },
};

const mutations = {
  [GET_MESSAGE_REQUEST](state) {
    state.message.requesting = true;
    state.message.status = '';
    state.message.error = null;
  },
  [GET_MESSAGE_SUCCESS](state, payload) {
    state.message.requesting = false;
    state.message.status = 'success';
    state.message.result = payload;
  },
  [GET_MESSAGE_FAIL](state, payload) {
    state.message.requesting = false;
    state.message.status = 'error';
    state.message.result = payload;
  },
  [SEND_MESSAGE](state, payload) {
    console.log(payload);
    const currentMessages = get(state, 'message.result.data', []);
    const nextMessages = [payload, ...currentMessages];
    set(state, 'message.result.data', nextMessages);
  },

  [RECEIVE_MESSAGE](state, payload) {
    console.log(payload);
    const currentMessages = get(state, 'message.result.data', []);
    const nextMessages = [payload, ...currentMessages];
    set(state, 'message.result.data', nextMessages);
  },
};

const getters = {
  messages: state => cloneDeep(get(state, 'message.result.data', [])).reverse(),
};

export default {
  state: initState,
  actions,
  mutations,
  getters,
};
