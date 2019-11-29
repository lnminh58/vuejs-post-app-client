<template>
  <div id="app">
    <div v-if="$route.path !== '/login'">
      <nav class="navbar navbar-expand-md navbar-dark nav position-fixed w-100">
        <a class="navbar-brand title font-weight-bold" @click="handleToogleSidebar">
          ADONIS / VUE JS
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li
              class="nav-item"
              :class="{ active: $route.path === route.path }"
              v-for="(route, index) in routes"
              :key="index"
            >
              <router-link class="nav-link" :to="route.path">
                {{ route.label }}
              </router-link>
            </li>
            <button class="btn btn-outline-light d-block d-md-none" @click="handleSignOut">
              Logout
            </button>
          </ul>
        </div>
        <button class="btn btn-outline-light d-none d-md-block" @click="handleSignOut">
          Logout
        </button>
      </nav>
      <div class="d-flex" id="wrapper" :class="{ toggled: toggleSidebar }">
        <div id="sidebar-wrapper">
          <div class="sidebar-content pb-5 mt-2 text-center">
            <img
              :src="_.get(profile, 'avatarUrl') || require('./assets/img/default-avatar.png')"
              alt="avatar"
              class="img-fluid mt-4 bg-dark rounded-circle avatar"
            />
            <ul class="infor-list list-unstyled mt-4 text-left mx-2 lead">
              <li class="text-white text-truncate mt-2">
                <i class="fa fa-user mr-2"></i>
                {{ _.get(currentUser, 'username', '') }}
              </li>
              <li class="text-white text-truncate mt-2">
                <i class="fa fa-transgender mr-2"></i>
                {{ _.get(profile, 'gender') === GENDER.female ? 'Female' : 'Male' }}
              </li>
              <li class="text-white text-truncate mt-2">
                <i class="fa fa-home mr-2"></i>
                {{ _.get(profile, 'address', '') }}
              </li>
              <li class="text-white text-truncate mt-2">
                <i class="fa fa-map-marker mr-2"></i>
                {{ `${_.get(profile, 'city', '')} ${_.get(profile, 'country', '')}` }}
              </li>
            </ul>

            <ul id="user-routes" class="infor-list list-unstyled mt-4 text-left mx-2 lead">
              <li class="mx-2">
                <router-link to="/profile" class="text-decoration-none text-light"
                  >Profile</router-link
                >
              </li>
              <li class="mx-2 mt-3">
                <router-link to="/post" class="text-decoration-none text-light"
                  >My Posts</router-link
                >
              </li>
              <li class="mx-2 mt-3">
                <router-link to="/post/liked" class="text-decoration-none text-light"
                  >Liked Posts</router-link
                >
              </li>
            </ul>
          </div>
        </div>
        <div id="page-content-wrapper">
          <div>
            <router-view />
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { get } from 'lodash';

import { GENDER, LOGIN_SOURCE } from './constants/defaultValues';
import { getFbSdk, fbLogout, getFbLoginStatus } from './services/FacebookAuth';
import { initGoogleAuth } from './services/GoogleAuth';

export default {
  data() {
    return {
      GENDER,
      toggleSidebar: false,
      autoToggleSideBar: true,
      routes: [{ path: '/', label: 'Home' }],
    };
  },
  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      profile: 'userProfile',
    }),
  },

  watch: {
    currentUser() {
      const userId = get(this.currentUser, 'id');
      if (userId) {
        this.$store.dispatch('getUserProfile', get(this.currentUser, 'id'));
      }
    },
  },
  created() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    const userId = get(this.currentUser, 'id');
    if (userId) {
      this.$store.dispatch('getUserProfile', get(this.currentUser, 'id'));
      this.$store.dispatch('getCategories');
    }
  },

  destroyed() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async handleSignOut() {
      const { loginSource } = this.currentUser;

      switch (loginSource) {
        case LOGIN_SOURCE.facebook:
          if (!window.FB) await getFbSdk({ appId: process.env.VUE_APP_FACEBOOK_CLIENT_ID });
          await getFbLoginStatus();
          await fbLogout();
          break;

        case LOGIN_SOURCE.google:
          if (!window.gapi.auth2) {
            await initGoogleAuth({ client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID });
          }
          // eslint-disable-next-line no-case-declarations
          const googleAuth = window.gapi.auth2.getAuthInstance();
          googleAuth.disconnect();
          googleAuth.signOut();
          break;
        default:
      }

      this.$store.dispatch('signOut');
    },

    handleToogleSidebar() {
      this.toggleSidebar = !this.toggleSidebar;
      this.autoToggleSideBar = !this.toggleSidebar;
    },

    handleResize() {
      const screenWidth = window.innerWidth;
      if (this.autoToggleSideBar) {
        if (!this.toggleSidebar && screenWidth < 768) {
          this.toggleSidebar = true;
        }

        if (screenWidth >= 768) {
          this.toggleSidebar = false;
        }
      }
    },
  },
};
</script>

<style>
@import './assets/css/app.css';
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.title {
  color: rgb(48, 113, 129);
  background: linear-gradient(235deg, #009ee7, #ff0aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 10px #444444d3;
  font-size: 20pt;
}
.nav {
  background: rgb(0, 40, 63);
  z-index: 1000;
  box-shadow: 0px 3px 10px rgb(36, 36, 36);
}

body {
  overflow-x: hidden;
}

.avatar {
  border: #fffaebaf 2px solid;
  box-shadow: 0px 5px 20px 5px rgb(37, 35, 35);
  width: 150px;
  height: 150px;
  object-fit: cover;
}

.infor-list {
  text-shadow: 2px 2px 5px rgb(68, 68, 68);
}

.infor-list > li > i {
  width: 20px;
  text-align: center;
}

#sidebar-wrapper {
  background: linear-gradient(180deg, rgb(0, 40, 63), rgb(70, 177, 196)) !important;
  height: 100%;
  -webkit-transition: margin 0.25s ease-out;
  -moz-transition: margin 0.25s ease-out;
  -o-transition: margin 0.25s ease-out;
  transition: margin 0.25s ease-out;
  position: fixed !important;
  z-index: 1;
  overflow-y: scroll;
  padding-top: 66px;
  margin-left: 0rem;
}

#sidebar-wrapper .sidebar-content {
  width: 16rem;
  overflow-y: scroll;
}

#page-content-wrapper {
  min-width: calc(100vw - 16rem);
  padding-top: 66px;
  margin-left: 16rem;
}

#wrapper.toggled #sidebar-wrapper {
  margin-left: -16rem;
}
#wrapper.toggled #page-content-wrapper {
  margin-left: 0;
  min-width: 100vw;
}

#user-routes li {
  border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}
</style>
