import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import './config';

import Vue from 'vue';
import { ValidationProvider, ValidationObserver } from 'vee-validate/dist/vee-validate.full';
import VModal from 'vue-js-modal';
import GSignInButton from 'vue-google-signin-button';
import axios from 'axios';
import { get } from 'lodash';
import VueCarousel from 'vue-carousel';
import { VueMasonryPlugin } from 'vue-masonry';

import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/index.css';

import App from './App.vue';
import router from './router';
import store from './store';
import lodash from './mixins/lodash';
import moment from './mixins/moment';

Vue.config.productionTip = false;

const mixins = [lodash, moment];
mixins.forEach(mixin => Vue.mixin(mixin));

Vue.use(VModal);
Vue.use(VueToast, {
  // One of options
  position: 'top',
});
Vue.use(GSignInButton);
Vue.use(VueCarousel);
Vue.use(VueMasonryPlugin);

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);

const currentUser = get(store, 'getters.currentUser');
const token = get(currentUser, 'token');
const authenType = get(currentUser, 'type');
if (token) {
  axios.defaults.headers.common.Authorization = `${authenType} ${token}`;
}

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
