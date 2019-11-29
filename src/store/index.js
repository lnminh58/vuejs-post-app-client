import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

// eslint-disable-next-line import/no-cycle
import user from './user';
import post from './post';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    user,
    post
  },
  plugins: [
    createPersistedState({
      paths: ['user.signIn'],
    }),
  ],
});
