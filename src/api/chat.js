import http from '../services/http';

export default class Chat {
  static getMessageByConversation(id, params, config = {}) {
    return http.get(`/message/${id}`, {
      ...config,
      params,
    });
  }

  static getUserConversation(params, config = {}) {
    return http.get('/users/conversation', {
      ...config,
      params,
    });
  }

  static findExistConversation(params, config = {}) {
    return http.get('users/find-conversation-by-topic', {
      ...config,
      params,
    });
  }
}
