import {
  get, set, cloneDeep, first
} from 'lodash';
import { serializeError } from 'serialize-error';

// eslint-disable-next-line import/no-cycle
import Chat from '../api/chat';

import {
  GET_MESSAGE_REQUEST,
  GET_MESSAGE_SUCCESS,
  GET_MESSAGE_FAIL,
  SEND_MESSAGE,
  RECEIVE_MESSAGE,
  GET_USER_CONVERSATION_REQUEST,
  GET_USER_CONVERSATION_SUCCESS,
  GET_USER_CONVERSATION_FAIL,
  CLEAR_MESSAGES,
  FIND_EXIST_COVERSATION_REQUEST,
  FIND_EXIST_COVERSATION_SUCCESS,
  FIND_EXIST_COVERSATION_FAIL,
  RECEIVE_CONVERSATION_UPDATE,
} from '../constants/mutationTypes';

const initState = {
  message: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  conversation: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  existConversation: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
};

const actions = {
  async getMessageByConversation({ commit }, { page, conversationId, lastMessageId }) {
    commit(GET_MESSAGE_REQUEST);
    try {
      const res = await Chat.getMessageByConversation(conversationId, {
        limit: 25,
        page,
        lastMessageId,
      });
      const { data } = res;

      const firstSessionLastMessageId = lastMessageId || get(first(get(data, 'data', [])), 'id');

      const cookData = {
        ...data,
        conversationId,
        lastMessageId: firstSessionLastMessageId,
        data: get(data, 'data', []).map(item => ({
          message: get(item, 'content'),
          userId: get(item, 'userId'),
          createdAt: get(item, 'createdAt'),
          username: get(item, 'user.username'),
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

  async getUserConversation({ commit }, { page = 0 }) {
    commit(GET_USER_CONVERSATION_REQUEST);
    try {
      const res = await Chat.getUserConversation(3, {
        limit: 100,
        page,
      });

      commit(GET_USER_CONVERSATION_SUCCESS, res.data);
    } catch (error) {
      commit(GET_USER_CONVERSATION_FAIL, { error: serializeError(error) });
    }
  },

  async clearMessages({ commit }) {
    commit(CLEAR_MESSAGES);
  },

  async findExistConversation({ commit }, topic) {
    commit(FIND_EXIST_COVERSATION_REQUEST);
    try {
      const res = await Chat.findExistConversation({ topic });
      const { data } = res;
      commit(FIND_EXIST_COVERSATION_SUCCESS, { data });
    } catch (error) {
      commit(FIND_EXIST_COVERSATION_FAIL, { error: serializeError(error) });
    }
  },

  async receiveConversationUpdate({ commit }, conversation) {
    commit(RECEIVE_CONVERSATION_UPDATE, conversation);
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
    state.message.result = payload.page === 1
      ? payload
      : {
        ...payload,
        data: [...get(state, 'message.result.data', []), ...payload.data],
      };
  },
  [GET_MESSAGE_FAIL](state, payload) {
    state.message.requesting = false;
    state.message.status = 'error';
    state.message.error = payload;
  },
  [SEND_MESSAGE](state, payload) {
    const currentMessages = get(state, 'message.result.data', []);
    const nextMessages = [payload, ...currentMessages];
    set(state, 'message.result.data', nextMessages);
  },

  [RECEIVE_MESSAGE](state, payload) {
    const currentMessages = get(state, 'message.result.data', []);
    const nextMessages = [payload, ...currentMessages];
    set(state, 'message.result.data', nextMessages);
  },
  [GET_USER_CONVERSATION_REQUEST](state) {
    state.conversation.requesting = true;
    state.conversation.status = '';
    state.conversation.error = null;
  },
  [GET_USER_CONVERSATION_SUCCESS](state, payload) {
    state.conversation.requesting = false;
    state.conversation.status = 'success';
    state.conversation.result = payload;
  },
  [GET_USER_CONVERSATION_FAIL](state, payload) {
    state.conversation.requesting = false;
    state.conversation.status = 'error';
    state.conversation.error = payload;
  },
  [CLEAR_MESSAGES](state) {
    set(state, 'message.result.data', []);
  },
  [FIND_EXIST_COVERSATION_REQUEST](state) {
    state.existConversation.requesting = true;
    state.existConversation.status = '';
    state.existConversation.result = null;
    state.existConversation.error = null;
  },
  [FIND_EXIST_COVERSATION_SUCCESS](state, payload) {
    state.existConversation.requesting = false;
    state.existConversation.status = 'success';
    state.existConversation.result = payload;
  },
  [FIND_EXIST_COVERSATION_FAIL](state, payload) {
    state.existConversation.requesting = false;
    state.existConversation.status = 'error';
    state.existConversation.error = payload;
  },
  [RECEIVE_CONVERSATION_UPDATE](state, payload) {
    const currentConversations = get(state, 'conversation.result.data', []);
    const nextConversation = [
      payload,
      ...currentConversations.filter(conversation => conversation.id !== payload.id),
    ];
    set(state, 'conversation.result.data', nextConversation);
  },
};

const getters = {
  messages: state => cloneDeep(get(state, 'message.result.data', [])).reverse(),
  conversations: state => get(state, 'conversation.result.data', []),
  existConversation: state => get(state, 'existConversation.result.data', []),
};

export default {
  state: initState,
  actions,
  mutations,
  getters,
};
