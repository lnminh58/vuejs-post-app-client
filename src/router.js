import Vue from 'vue';
import Router from 'vue-router';
import { get } from 'lodash';

// eslint-disable-next-line import/no-cycle
import store from '@/store';

import Home from './views/Home.vue';
import Profile from './views/Profile.vue';
import Login from './views/Login.vue';
import ForgetPassword from './views/ForgetPassword.vue';
import Post from './views/Post.vue';
import PostEdit from './views/PostEdit.vue';
import PageNotFound from './views/Error/PageNotFound.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
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
    },
    {
      path: '/post/post-edit',
      name: 'post-edit',
      component: PostEdit,
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

export default router;
