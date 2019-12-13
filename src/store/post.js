import { serializeError } from 'serialize-error';
import { get } from 'lodash';

// eslint-disable-next-line import/no-cycle
import Post from '@/api/post';
import { compressImage } from '@/utils/general';
import { POSTS_PER_PAGE } from '@/constants/defaultValues';

import {
  GET_CATEGORIES_REQUEST,
  GET_CATEGORIES_SUCCESS,
  GET_CATEGORIES_FAIL,
  SAVE_POST_REQUEST,
  SAVE_POST_SUCCESS,
  SAVE_POST_FAIL,
  GET_MY_POST_REQUEST,
  GET_MY_POST_SUCCESS,
  GET_MY_POST_FAIL,
  DELETE_POST_REQUEST,
  DELETE_POST_SUCCESS,
  DELETE_POST_FAIL,
  GET_POSTS_REQUEST,
  GET_POSTS_SUCCESS,
  GET_POSTS_FAIL,
  OPEN_POST_LINKING,
  TOOGLE_LIKE_POST_REQUEST,
  TOOGLE_LIKE_POST_SUCCESS,
  TOOGLE_LIKE_POST_FAIL,
} from '../constants/mutationTypes';

const initState = {
  category: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
  postSaving: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
  myPost: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  postDeleting: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
  publicPost: {
    requesting: false,
    status: '',
    result: {},
    error: null,
  },
  likePost: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
};

const actions = {
  async getCategories({ commit }) {
    commit(GET_CATEGORIES_REQUEST);
    try {
      const res = await Post.getCategories();
      const data = get(res, 'data');
      commit(GET_CATEGORIES_SUCCESS, { data });
    } catch (error) {
      console.log(serializeError(error));
      commit(GET_CATEGORIES_FAIL, { error: serializeError(error) });
    }
  },

  async savePost({ commit }, body) {
    commit(SAVE_POST_REQUEST);
    try {
      const formFields = get(body, 'postForm');
      const media = get(body, 'media');
      const formData = new FormData();
      const image = await compressImage(media);
      formData.append('media', image);

      Object.keys(formFields).forEach(field => {
        let value = formFields[field];

        value = Array.isArray(value) ? JSON.stringify(value) : value;

        formData.append(field, value);
      });

      const res = await Post.savePost(formData);
      const { data } = res;
      commit(SAVE_POST_SUCCESS, { data });
    } catch (error) {
      console.log(serializeError(error));
      commit(SAVE_POST_FAIL, { error: serializeError(error) });
    }
  },

  async getMyPosts({ commit }, params) {
    commit(GET_MY_POST_REQUEST);
    try {
      const res = await Post.getPostByUser({
        ...params,
        limit: POSTS_PER_PAGE,
      });
      const data = get(res, 'data');
      commit(GET_MY_POST_SUCCESS, data);
    } catch (error) {
      console.log(serializeError(error));
      commit(GET_MY_POST_FAIL, { error: serializeError(error) });
    }
  },

  async getPosts({ commit }, params) {
    commit(GET_POSTS_REQUEST, params.page);
    try {
      const res = await Post.getPosts({
        ...params,
        limit: POSTS_PER_PAGE,
      });
      const data = get(res, 'data');
      commit(GET_POSTS_SUCCESS, data);
    } catch (error) {
      console.log(serializeError(error));
      commit(GET_POSTS_FAIL, { error: serializeError(error) });
    }
  },

  async deletePost({ commit }, body) {
    commit(DELETE_POST_REQUEST);
    try {
      console.log(body);
      const res = await Post.deletePost(body);
      const data = get(res, 'data');
      commit(DELETE_POST_SUCCESS, data);
    } catch (error) {
      console.log(serializeError(error));
      commit(DELETE_POST_FAIL, { error: serializeError(error) });
    }
  },

  async openPostLinking({ commit }, body) {
    try {
      const { postId } = body;
      const res = await Post.openPostLinking(body);
      console.log(res);
      commit(OPEN_POST_LINKING, postId);
    } catch (error) {
      console.log(serializeError(error));
    }
  },

  async toogleLikePost({ commit }, body) {
    commit(TOOGLE_LIKE_POST_REQUEST, body);
    try {
      const res = await Post.likePost(body);
      console.log(res);
      commit(TOOGLE_LIKE_POST_SUCCESS, body);
    } catch (error) {
      console.log(serializeError(error));
      commit(TOOGLE_LIKE_POST_FAIL, { error: serializeError(error), ...body });
    }
  },
};

const mutations = {
  [GET_CATEGORIES_REQUEST](state) {
    state.category.requesting = true;
    state.category.status = '';
  },
  [GET_CATEGORIES_SUCCESS](state, payload) {
    state.category.requesting = false;
    state.category.status = 'success';
    state.category.result = payload;
  },
  [GET_CATEGORIES_FAIL](state, payload) {
    state.category.requesting = false;
    state.category.status = 'error';
    state.category.error = payload.error;
  },
  [SAVE_POST_REQUEST](state) {
    state.postSaving.requesting = true;
    state.postSaving.status = '';
  },
  [SAVE_POST_SUCCESS](state, payload) {
    state.postSaving.requesting = false;
    state.postSaving.status = 'success';
    state.postSaving.result = payload;
  },
  [SAVE_POST_FAIL](state, payload) {
    state.postSaving.requesting = false;
    state.postSaving.status = 'error';
    state.postSaving.error = payload.error;
  },
  [GET_MY_POST_REQUEST](state) {
    state.myPost.requesting = true;
    state.myPost.status = '';
  },
  [GET_MY_POST_SUCCESS](state, payload) {
    state.myPost.requesting = false;
    state.myPost.status = 'success';
    state.myPost.result = payload.page === 1
      ? payload
      : {
        ...payload,
        data: [...get(state, 'myPost.result.data', []), ...get(payload, 'data', [])],
      };
  },
  [GET_MY_POST_FAIL](state, payload) {
    state.publicPost.requesting = false;
    state.publicPost.status = 'error';
    state.publicPost.error = payload.error;
  },
  [GET_POSTS_REQUEST](state, payload) {
    state.publicPost.requesting = true;
    state.publicPost.status = '';
    state.publicPost.result = payload === 1 ? {} : state.publicPost.result;
  },
  [GET_POSTS_SUCCESS](state, payload) {
    state.publicPost.requesting = false;
    state.publicPost.status = 'success';
    state.publicPost.result = payload.page === 1
      ? payload
      : {
        ...payload,
        data: [...get(state, 'publicPost.result.data', []), ...get(payload, 'data', [])],
      };
  },
  [GET_POSTS_FAIL](state, payload) {
    state.publicPost.requesting = false;
    state.publicPost.status = 'error';
    state.publicPost.error = payload.error;
  },
  [DELETE_POST_REQUEST](state) {
    state.postDeleting.requesting = true;
    state.postDeleting.status = '';
  },
  [DELETE_POST_SUCCESS](state, payload) {
    state.postDeleting.requesting = false;
    state.postDeleting.status = 'success';
    state.postDeleting.result = payload;
    state.myPost.result = {
      ...state.myPost.result,
      data: get(state, 'myPost.result.data', []).filter(post => post.id !== payload),
    };
  },
  [DELETE_POST_FAIL](state, payload) {
    state.postDeleting.requesting = false;
    state.postDeleting.status = 'error';
    state.postDeleting.error = payload.error;
  },
  [OPEN_POST_LINKING](state, payload) {
    state.publicPost.result = {
      ...state.publicPost.result,
      data: get(state, 'publicPost.result.data', []).map(post => (post.id !== payload
        ? post
        : {
          ...post,
          view: post.view + 1,
        }),),
    };
  },
  [TOOGLE_LIKE_POST_REQUEST](state, payload) {
    state.likePost.requesting = true;
    state.likePost.status = '';
    state.publicPost.result = payload.hasLiked
      ? {
        ...state.publicPost.result,
        data: get(state, 'publicPost.result.data', []).map(post => (post.id !== payload.postId
          ? post
          : {
            ...post,
            __meta__: {
              ...get(post, '__meta__'),
              isUserLiked: 0,
              totalLikeds: parseInt(get(post, '__meta__.totalLikeds'), 10) - 1
            },
          }),),
      }
      : {
        ...state.publicPost.result,
        data: get(state, 'publicPost.result.data', []).map(post => (post.id !== payload.postId
          ? post
          : {
            ...post,
            __meta__: {
              ...get(post, '__meta__'),
              isUserLiked: 1,
              totalLikeds: parseInt(get(post, '__meta__.totalLikeds'), 10) + 1
            },
          }),),
      };
  },
  [TOOGLE_LIKE_POST_SUCCESS](state, payload) {
    state.likePost.requesting = false;
    state.likePost.status = 'success';
    state.likePost.result = payload;
  },
  [TOOGLE_LIKE_POST_FAIL](state, payload) {
    state.likePost.requesting = false;
    state.likePost.status = 'error';
    state.likePost.error = payload.error;
    state.publicPost.result = payload.hasLiked
      ? {
        ...state.publicPost.result,
        data: get(state, 'publicPost.result.data', []).map(post => (post.id !== payload.postId
          ? post
          : {
            ...post,
            __meta__: {
              ...get(post, '__meta__'),
              isUserLiked: 1,
              totalLikeds: parseInt(get(post, '__meta__.totalLikeds'), 10) + 1
            },
          }),),
      }
      : {
        ...state.publicPost.result,
        data: get(state, 'publicPost.result.data', []).map(post => (post.id !== payload.postId
          ? post
          : {
            ...post,
            __meta__: {
              ...get(post, '__meta__'),
              isUserLiked: 0,
              totalLikeds: parseInt(get(post, '__meta__.totalLikeds'), 10) - 1,
            },
          }),),
      };
  },
};

const getters = {
  categories: state => get(state, 'category.result.data', []),
  myPosts: state => get(state, 'myPost.result.data', []),
  publicPosts: state => get(state, 'publicPost.result.data', []),
  postDetail: state => get(state, 'publicPost.result.data[0]'),
};

export default {
  state: initState,
  actions,
  mutations,
  getters,
};
