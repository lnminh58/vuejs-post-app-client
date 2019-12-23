import { serializeError } from 'serialize-error';
import { get, set } from 'lodash';

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
  OPEN_POST_LINKING_REQUEST,
  OPEN_POST_LINKING_SUCCESS,
  OPEN_POST_LINKING_FAIL,
  TOOGLE_LIKE_POST_REQUEST,
  TOOGLE_LIKE_POST_SUCCESS,
  TOOGLE_LIKE_POST_FAIL,
  GET_POST_DETAIL_REQUEST,
  GET_POST_DETAIL_SUCCESS,
  GET_POST_DETAIL_FAIL,
  CHANGE_HASHTAG_PARAM,
  CHANGE_CATEGORY_PARAM,
  GET_LIKED_POST_REQUEST,
  GET_LIKED_POST_SUCCESS,
  GET_LIKED_POST_FAIL,
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
  likedPost: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
  likePost: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
  linkingOpening: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
  postDetail: {
    requesting: false,
    status: '',
    result: null,
    error: null,
  },
  postQuery: {
    hashtag: null,
    category: null,
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
      commit(GET_MY_POST_FAIL, { error: serializeError(error) });
    }
  },

  async getLikedPost({ commit }, params) {
    commit(GET_LIKED_POST_REQUEST);
    try {
      const res = await Post.getLikedPosts({
        ...params,
        limit: POSTS_PER_PAGE,
      });
      const data = get(res, 'data');
      commit(GET_LIKED_POST_SUCCESS, data);
    } catch (error) {
      commit(GET_LIKED_POST_FAIL, { error: serializeError(error) });
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
      commit(GET_POSTS_FAIL, { error: serializeError(error) });
    }
  },

  async deletePost({ commit }, body) {
    commit(DELETE_POST_REQUEST);
    try {
      const res = await Post.deletePost(body);
      const data = get(res, 'data');
      commit(DELETE_POST_SUCCESS, data);
    } catch (error) {
      commit(DELETE_POST_FAIL, { error: serializeError(error) });
    }
  },

  async openPostLinking({ commit }, body) {
    commit(OPEN_POST_LINKING_REQUEST);
    try {
      const { postId } = body;
      await Post.openPostLinking(body);
      commit(OPEN_POST_LINKING_SUCCESS, postId);
    } catch (error) {
      commit(OPEN_POST_LINKING_FAIL, { error: serializeError(error) });
    }
  },

  async toogleLikePost({ commit }, body) {
    commit(TOOGLE_LIKE_POST_REQUEST, body);
    try {
      const res = await Post.likePost(body);
      const data = get(res, 'data');
      commit(TOOGLE_LIKE_POST_SUCCESS, data);
    } catch (error) {
      console.log(serializeError(error));
      commit(TOOGLE_LIKE_POST_FAIL, { error: serializeError(error), ...body });
    }
  },

  async getPostDetail({ commit }, id) {
    commit(GET_POST_DETAIL_REQUEST);
    try {
      const res = await Post.getPostDetail(id);
      const { data } = res;
      commit(GET_POST_DETAIL_SUCCESS, { data });
    } catch (error) {
      console.log(serializeError(error));
      commit(GET_POST_DETAIL_FAIL, { error: serializeError(error) });
    }
  },

  changeHashtagParam({ commit }, hashtag) {
    commit(CHANGE_HASHTAG_PARAM, hashtag);
  },

  changeCategoryParam({ commit }, category) {
    commit(CHANGE_CATEGORY_PARAM, category);
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
    state.myPost.requesting = false;
    state.myPost.status = 'error';
    state.myPost.error = payload.error;
  },
  [GET_LIKED_POST_REQUEST](state) {
    state.likedPost.requesting = true;
    state.likedPost.status = '';
  },
  [GET_LIKED_POST_SUCCESS](state, payload) {
    state.likedPost.requesting = false;
    state.likedPost.status = 'success';
    state.likedPost.result = payload.page === 1
      ? payload
      : {
        ...payload,
        data: [...get(state, 'likedPost.result.data', []), ...get(payload, 'data', [])],
      };
  },
  [GET_LIKED_POST_FAIL](state, payload) {
    state.likedPost.requesting = false;
    state.likedPost.status = 'error';
    state.likedPost.error = payload.error;
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
  [OPEN_POST_LINKING_REQUEST](state) {
    state.linkingOpening.requesting = true;
    state.linkingOpening.status = '';
    state.linkingOpening.result = null;
  },
  [OPEN_POST_LINKING_SUCCESS](state, payload) {
    state.linkingOpening.requesting = false;
    state.linkingOpening.status = 'success';
    state.linkingOpening.result = payload;
    state.publicPost.result = {
      ...state.publicPost.result,
      data: get(state, 'publicPost.result.data', []).map(post => (post.id !== payload
        ? post
        : {
          ...post,
          view: post.view + 1,
        }),),
    };
    if (payload === get(state, 'postDetail.result.data.id')) {
      const currentView = get(state, 'postDetail.result.data.view');
      set(state, 'postDetail.result.data.view', currentView + 1);
    }

    state.likedPost.result = {
      ...state.likedPost.result,
      data: get(state, 'likedPost.result.data', []).map(post => (post.id !== payload
        ? post
        : {
          ...post,
          view: post.view + 1,
        }),),
    };
  },
  [OPEN_POST_LINKING_FAIL](state, payload) {
    state.linkingOpening.requesting = true;
    state.linkingOpening.status = 'error';
    state.linkingOpening.error = payload.error;
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
              totalLikeds: parseInt(get(post, '__meta__.totalLikeds'), 10) - 1,
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
              totalLikeds: parseInt(get(post, '__meta__.totalLikeds'), 10) + 1,
            },
          }),),
      };
    if (payload.postId === get(state, 'postDetail.result.data.id')) {
      const currentLike = parseInt(get(state, 'postDetail.result.data.__meta__.totalLikeds'), 10);
      set(
        state,
        'postDetail.result.data.__meta__.totalLikeds',
        currentLike + (payload.hasLiked ? -1 : 1),
      );
      set(state, 'postDetail.result.data.__meta__.isUserLiked', payload.hasLiked ? 0 : 1);
    }

    if (payload.hasLiked) {
      state.likedPost.result = {
        ...get(state, 'likedPost.result', {}),
        data: get(state, 'likedPost.result.data', []).filter(post => post.id !== payload.postId),
      };
    }
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
              totalLikeds: parseInt(get(post, '__meta__.totalLikeds'), 10) + 1,
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

    if (payload.postId === get(state, 'postDetail.result.data.id')) {
      const currentLike = parseInt(get(state, 'postDetail.result.data.__meta__.totalLikeds'), 10);
      set(
        state,
        'postDetail.result.data.__meta__.totalLikeds',
        currentLike + (payload.hasLiked ? 1 : -1),
      );
      set(state, 'postDetail.result.data.__meta__.isUserLiked', payload.hasLiked ? 1 : 0);
    }
  },

  [GET_POST_DETAIL_REQUEST](state) {
    state.postDetail.requesting = true;
    state.postDetail.status = '';
    state.postDetail.result = null;
  },
  [GET_POST_DETAIL_SUCCESS](state, payload) {
    state.postDetail.requesting = false;
    state.postDetail.status = 'success';
    state.postDetail.result = payload;
  },
  [GET_POST_DETAIL_FAIL](state, payload) {
    state.postDetail.requesting = false;
    state.postDetail.status = 'error';
    state.postDetail.error = payload.error;
  },

  [CHANGE_HASHTAG_PARAM](state, payload) {
    state.postQuery.hashtag = payload;
  },

  [CHANGE_CATEGORY_PARAM](state, payload) {
    state.postQuery.category = payload;
  },
};

const getters = {
  categories: state => get(state, 'category.result.data', []),
  myPosts: state => get(state, 'myPost.result.data', []),
  likedPosts: state => get(state, 'likedPost.result.data', []),
  publicPosts: state => get(state, 'publicPost.result.data', []),
  postDetail: state => get(state, 'postDetail.result.data'),
};

export default {
  state: initState,
  actions,
  mutations,
  getters,
};
