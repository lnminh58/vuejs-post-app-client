import http from '../services/http';

export default class Chat {
  static getMessageByConversation(id, params, config = {}) {
    return http.get(`/message/${id}`, {
      ...config,
      params,
    });
  }
}
