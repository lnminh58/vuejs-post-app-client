import http from '../services/http';

export default class Post {
  static getCategories(config) {
    return http.get('/categories', config);
  }

  static savePost(body, config) {
    return http.post('/post/save', body, config);
  }

  static getPosts(params, config = {}) {
    return http.get('post/get', {
      ...config,
      params,
    });
  }

  static getPostByUser(params, config = {}) {
    return http.get('users/post', {
      ...config,
      params,
    });
  }

  static openPostLinking(body, config = {}) {
    return http.patch('post/open-post-linking', body, config);
  }

  static likePost(body, config = {}) {
    return http.post('users/post/like', body, config);
  }

  static deletePost(params, config = {}) {
    return http.delete('post/delete', {
      ...config,
      params,
    });
  }
}
