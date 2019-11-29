<template>
  <div>
    <div
      class="vh-100 bg-info d-flex flex-column justify-content-center
        align-items-center login-container"
      :class="{ blur: isModalShown }"
    >
      <div class="pb-3">
        <blockquote class="blockquote text-center">
          <span class="mb-0 h1 font-weight-lighter font-italic title">
            Vuejs Adonis CRUD System demo.
          </span>
          <footer class="blockquote-footer text-right">Adonis Vuejs <cite>Frameworks</cite></footer>
        </blockquote>
      </div>
      <div
        class="login-card bg-semi-transparent card px-4 pt-5 pb-4 shadow-lg w-25
          rounded-0 text-left my-5"
        :class="{ 'bg-transparent': isModalShown }"
      >
        <span class="text-danger mb-3 text-center"
          >{{ loginError }}

          <button
            :disabled="_.get(verifyEmail, 'requesting') || countDownSendEmail !== 0"
            @click="handleResendVerifyEmail()"
            class="btn btn-link text-info"
            v-if="needActiveEmail"
          >
            Click here to resend a verify email
          </button>
          <span v-if="countDownSendEmail !== 0" class="text-secondary">
            Try again after {{ countDownSendEmail }} second(s)
          </span>
        </span>
        <ValidationObserver ref="signInValidator" v-slot="{ invalid }">
          <TextField
            name="Email"
            :hiddenLabel="true"
            type="text"
            rules="required|email"
            placeholder="Email"
            v-model="signInForm.email"
          />
          <div class="mt-4" />
          <TextField
            name="Password"
            :hiddenLabel="true"
            type="password"
            rules="required|min:6"
            placeholder="Password"
            v-model="signInForm.password"
          />
          <button
            class="btn btn-block btn-outline-secondary mt-4 rounded-form"
            @click="handleSignIn"
            :disabled="_.get(signIn, 'requesting')"
          >
            <div class="spinner-grow spinner-grow-sm" v-if="_.get(signIn, 'requesting')" />
            <span class="font-weight-normal" v-else>login</span>
          </button>
        </ValidationObserver>
        <p class="muted mt-4 text-secondary text-center">
          Not registered?
          <a href="#" class="text-info" @click="$modal.show('registerModal')">
            Create an account
          </a>
        </p>

        <VFBLoginScope :appId="FACEBOOK_APP_ID" @login="handleLoginWithFacebook">
          <button
            slot-scope="scope"
            class="btn btn-primary rounded-form"
            :disabled="scope.disabled"
            @click="scope.toggleLogin"
          >
            <slot name="before" v-if="scope.enabled">
              <i class="fa fa-facebook"></i>
            </slot>
            <span>
              <slot name="login" v-if="scope.enabled && scope.disconnected">
                Sign in with Facebook
              </slot>
              <slot name="logout" v-if="scope.enabled && scope.connected">
                Sign out with Facebook
              </slot>
              <slot name="working" v-if="scope.working">
                <div class="spinner-grow spinner-grow-sm"></div>
              </slot>
            </span>
          </button>
        </VFBLoginScope>
        <g-signin-button
          :params="googleSignInParams"
          @success="onLoginWithGoogleSuccess"
          @error="onLoginWithGoogleError"
          class="btn btn-danger mt-2 rounded-form"
        >
          <i class="fa fa-google"></i>
          <span>
            Sign in with Google
          </span>
        </g-signin-button>
      </div>
    </div>
    <modal
      name="registerModal"
      height="auto"
      :draggable="true"
      :clickToClose="false"
      transition="nice-modal-fade"
      :delay="200"
      @before-open="isModalShown = true"
      @before-close="isModalShown = false"
      classes="shadow-lg"
      :pivotY="0.65"
    >
      <div class="modal-content rounded-0 modal-form">
        <ValidationObserver ref="signUpValidator">
          <div class="modal-header">
            <h5 class="modal-title lead text-secondary">
              Register New Account
            </h5>
            <button type="button" class="close" @click="$modal.hide('registerModal')">
              <span aria-hidden="true" class="text-danger">&times;</span>
            </button>
          </div>
          <div class="modal-body text-left px-4">
            <span
              class="text-danger d-block text-center mb-3 text-center"
              v-if="_.get(signUp, 'status') === 'error'"
              >{{ _.get(signUp, 'error.data[0].message', 'An error occur while processing') }}
            </span>
            <span
              class="text-info d-block text-center mb-3 text-center"
              v-if="_.get(signUp, 'status') === 'success'"
            >
              Your account has been register. A confirmation email has been sent to your email.
              Please check it.
            </span>
            <form>
              <TextField
                name="Email"
                type="email"
                rules="required|email"
                v-model="signUpForm.email"
              >
                <small slot="description" class="text-muted">
                  We'll never share your email with anyone else.
                </small>
              </TextField>
              <TextField
                name="Username"
                type="text"
                rules="required"
                v-model="signUpForm.username"
              />
              <TextField
                name="Password"
                type="password"
                rules="required|min:6"
                vid="confirmation"
                v-model="signUpForm.password"
              />
              <TextField
                name="Confirm Password"
                type="password"
                rules="required|min:6|confirmed:confirmation"
                v-model="signUpForm.confirmPassword"
              />
            </form>
          </div>
          <div class="modal-footer px-4">
            <button
              type="button"
              class="btn btn-outline-secondary rounded-form btn-block my-2"
              @click="handleSignUp"
              :disabled="_.get(signUp, 'requesting')"
            >
              <div class="spinner-grow spinner-grow-sm" v-if="_.get(signUp, 'requesting')" />
              <span v-else>
                Send
              </span>
            </button>
          </div>
        </ValidationObserver>
      </div>
    </modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { get } from 'lodash';
import { VFBLoginScope } from 'vue-facebook-login-component';

import { LOGIN_SOURCE } from '@/constants/defaultValues';
import TextField from '../components/TextField.vue';

export default {
  components: {
    TextField,
    VFBLoginScope,
  },
  data() {
    return {
      googleSignInParams: {
        client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID,
      },
      FACEBOOK_APP_ID: process.env.VUE_APP_FACEBOOK_CLIENT_ID,
      signUpForm: {
        email: null,
        username: null,
        passwword: null,
      },
      signInForm: {
        email: null,
        password: null,
      },
      needActiveEmail: null,
      loginError: null,
      signUpError: null,
      isModalShown: false,
      countDownSendEmail: 0,
    };
  },

  computed: {
    ...mapState({
      signIn: state => get(state, 'user.signIn'),
      signUp: state => get(state, 'user.signUp'),
      verifyEmail: state => get(state, 'user.verifyEmail'),
    }),
  },

  methods: {
    async handleSignUp() {
      const valid = await this.$refs.signUpValidator.validate();
      if (!valid) return;
      await this.$store.dispatch('signUp', this.signUpForm);
    },

    async handleSignIn() {
      const valid = await this.$refs.signInValidator.validate();
      if (!valid) return;
      await this.$store.dispatch('signIn', this.signInForm);
      const status = get(this.signIn, 'status');
      this.loginError = status === 'error'
        ? get(this.signIn, 'error.data.message', 'Email or Password is incorrect')
        : null;

      this.needActiveEmail = get(this.signIn, 'error.status') === 403;
    },

    async handleResendVerifyEmail() {
      const { email } = this.signInForm;
      // switch (emailOfForm) {
      //   case 'SIGN_UP':
      //     resendEmail = this.signUpForm.email;
      //     break;
      //   case 'SIGN_IN':
      //     resendEmail = this.signInForm.email;
      //     break;

      //   default:
      // }
      await this.$store.dispatch('resendVerifyAccountEmail', { email });

      const { status } = this.verifyEmail;
      this.$toast[status](`Email resend ${status}!`);

      if (status === 'success') {
        this.handleCountDownSendEmail();
      }
    },

    handleCountDownSendEmail() {
      this.countDownSendEmail = 60;
      const interval = setInterval(() => {
        this.countDownSendEmail -= 1;
        if (this.countDownSendEmail === 0) {
          clearInterval(interval);
        }
      }, 1000);
    },

    async handleLoginWithFacebook(facebookUser) {
      const { authResponse } = facebookUser;
      if (authResponse) {
        const accessToken = get(facebookUser, 'authResponse.accessToken');
        await this.$store.dispatch('loginWithSocial', {
          accessToken,
          loginSource: LOGIN_SOURCE.facebook,
        });
      }
    },

    async onLoginWithGoogleSuccess(googleUser) {
      if (googleUser) {
        const accessToken = get(googleUser, 'Zi.access_token');
        await this.$store.dispatch('loginWithSocial', {
          accessToken,
          loginSource: LOGIN_SOURCE.google,
        });
      }
    },

    async onLoginWithGoogleError(err) {
      console.log(err);
    },
  },
};
</script>

<style scoped>
.login-container {
  background: linear-gradient(235deg, #f699ffaf, #7cd6ec);
}
.login-card {
  min-width: 350px;
}
.rounded-form {
  border-radius: calc((1.5em + 0.75rem + 2px) / 2);
}

.text-error {
  color: rgb(228, 48, 84) !important;
}
.title {
  font-size: 30pt;
  color: rgb(48, 113, 129);
  background: linear-gradient(235deg, #008aca, #ff0aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 10px #444444d3;
}
.icon-send {
  width: 12px;
  height: 24px;
}
.bg-semi-transparent {
  background-color: rgba(245, 250, 255, 0.7);
}
.modal-form {
  background-color: rgba(255, 255, 255, 0.5);
  border-color: #ffffffbb;
}
.v--modal-overlay {
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.2), rgba(255, 255, 255, 0.3));
}
.blur {
  filter: blur(6px);
}
</style>
