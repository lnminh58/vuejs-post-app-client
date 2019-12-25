import Vue from 'vue';
import Router from 'vue-router';
import { get, set } from 'lodash';

// eslint-disable-next-line import/no-cycle
import store from '@/store';

import Home from './views/Home.vue';
import Profile from './views/Profile.vue';
import Login from './views/Login.vue';
import ForgetPassword from './views/ForgetPassword.vue';
import Post from './views/Post.vue';
import Bookmark from './views/Bookmark.vue';
import PostEdit from './views/PostEdit.vue';
import Chat from './views/Chat.vue';
import PostDetail from './views/PostDetail.vue';
import PageNotFound from './views/Error/PageNotFound.vue';

Vue.use(Router);

let isHardNav = false;
window.addEventListener('popstate', () => {
  isHardNav = true;
});

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        isShowPostDetailInModal: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/post',
      name: 'post',
      component: Post,
      meta: {
        isShowPostDetailInModal: true,
      },
    },
    {
      path: '/post/liked',
      name: 'post-liked',
      component: Bookmark,
      meta: {
        isShowPostDetailInModal: true,
      },
    },
    {
      path: '/post-detail/:id',
      name: 'post-detail',
      beforeEnter: (to, from, next) => {
        const isShowPostDetailInModal = from.matched.some(view => get(view, 'meta.isShowPostDetailInModal'),);
        if (!isShowPostDetailInModal || isHardNav) {
          set(to, 'matched[0].components', {
            default: PostDetail,
            modal: false,
          });
          set(to, 'query.isModal', false);
        } else {
          if (from.matched.length > 1) {
            // copy nested router
            const childrenView = from.matched.slice(1, from.matched.length);
            set(to, 'matched', [...get(to, 'matched'), ...childrenView]);
          }

          if (to.matched[0].components) {
            const fromDefault = get(from, 'matched[0].components.default');

            set(to, 'matched[0].components.default', fromDefault);
            set(to, 'matched[0].components.globalModal', PostDetail);
          }
          set(to, 'query.isModal', true);
        }
        next();
      },
      // component: PostDetail,
    },
    {
      path: '/post/post-edit',
      name: 'post-edit',
      component: PostEdit,
    },
    {
      path: '/message',
      name: 'message',
      component: Chat,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        public: true,
        onlyWhenLoggedOut: true,
      },
    },
    {
      path: '/forget-password',
      name: 'forget-password',
      component: ForgetPassword,
      meta: {
        public: true,
        onlyWhenLoggedOut: true,
      },
    },
    {
      path: '*',
      name: 'Not Found',
      component: PageNotFound,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = get(store, 'state.user.signIn.result.token');

  const isPublic = to.matched.some(record => record.meta.public);
  const onlyWhenLoggedOut = to.matched.some(record => record.meta.onlyWhenLoggedOut);

  if (!isPublic && !token) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }

  if (token && onlyWhenLoggedOut) {
    return next('/');
  }

  return next();
});

router.afterEach(() => {
  isHardNav = false;
});


export default router;
