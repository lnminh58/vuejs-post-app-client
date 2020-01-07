<template>
  <div class="container-fluid main-container min-vh-100 ">
    <div class="row justify-content-center">
      <div class="col-auto my-5">
        <blockquote class="blockquote text-center">
          <span class="mb-0 font-weight-lighter font-italic title d-block">
            Vuejs Adonis CRUD System demo.
          </span>
          <span class="blockquote-footer text-right"> Adonis Vuejs <cite>Frameworks</cite> </span>
        </blockquote>
      </div>
    </div>
    <div class="row justify-content-center pt-5 form-step">
      <div class="col-12 col-md-8 px-5 min-vh-10 step-bar-container">
        <step-progress
          :steps="formSteps"
          :current-step="currentStep"
          icon-class="fa fa-check"
          activeColor="rgb(0, 173, 130)"
          passiveColor="#cecece"
          :activeThickness="2"
          :lineThickness="5"
        ></step-progress>
      </div>

      <div class="col-12 col-md-8">
        <carousel
          :perPage="1"
          :paginationEnabled="false"
          :mouseDrag="false"
          :navigateTo="currentStep"
          :touchDrag="false"
        >
          <slide class="d-flex flex-column justify-content-center mt-5">
            <div class="mx-3 mx-md-5">
              <ValidationObserver ref="step1Validator">
                <TextField
                  hiddenLabel
                  name="Email"
                  type="email"
                  rules="required|email"
                  v-model="form.email"
                  tabindex="-1"
                >
                  <p slot="description" class="text-muted mt-2 mb-0">
                    Please provide email of your account.
                  </p>
                </TextField>
              </ValidationObserver>
            </div>
          </slide>
          <slide class="d-flex flex-column justify-content-center mt-5">
            <div class="mx-3 mx-md-5">
              <ValidationObserver ref="step2Validator">
                <form>
                  <TextField
                    hiddenLabel
                    name="code"
                    type="text"
                    rules="required"
                    class="mb-3"
                    tabindex="-1"
                    v-model="form.confirmCode"
                  >
                    <p slot="description" class="text-muted mt-2 mb-0">
                      Please enter the code that has been sent to your email address.
                    </p>
                  </TextField>
                </form>
              </ValidationObserver>
            </div>
          </slide>
          <slide class="d-flex flex-column justify-content-center mt-5">
            <div class="mx-3 mx-md-5">
              <ValidationObserver ref="step3Validator">
                <TextField
                  name="Password"
                  type="password"
                  rules="required|min:6"
                  vid="confirmation"
                  tabindex="-1"
                  v-model="form.password"
                >
                </TextField>
                <TextField
                  name="Confirm Password"
                  type="password"
                  rules="required|min:6|confirmed:confirmation"
                  :tabindex="currentStep === 2 ? null : -1"
                  v-model="form.confirmPassword"
                />
              </ValidationObserver>
            </div>
          </slide>
          <slide class="d-flex flex-column justify-content-center mt-5">
            <div class="mx-3 mx-md-5 text-center">
              <p class="h2 font-weight-light text-secondary">
                Your account password have been updated successfully!
              </p>
            </div>
          </slide>
        </carousel>
      </div>
      <div class="col-12">
        <div class=" d-flex justify-content-end">
          <button
            :disabled="currentStep >= 3 || isProcessing"
            class="btn btn-link text-info my-3 btn-submit"
            :class="{
              invisible: currentStep >= 3,
            }"
            @click="handleResetPassword"
          >
            <i class="fa fa-3x fa-arrow-circle-right" v-if="!isProcessing"></i>
            <div class="spinner-grow" v-else/>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StepProgress from 'vue-step-progress';
import 'vue-step-progress/dist/main.css';

import { mapState } from 'vuex';
import { get } from 'lodash';

import TextField from '../components/TextField.vue';

export default {
  data() {
    return {
      formSteps: ['Enter email', 'Verify', 'Change Password'],
      currentStep: 0,
      form: {
        email: null,
        confirmCode: null,
        password: null,
        confirmPassword: null,
      },
    };
  },

  components: {
    'step-progress': StepProgress,
    TextField,
  },

  computed: {
    ...mapState({
      passwordResetCodeSending: state => get(state, 'user.passwordResetCodeSending'),
      passwordResetting: state => get(state, 'user.passwordResetting'),
      passwordResetCodeVerifying: state => get(state, 'user.passwordResetCodeVerifying'),
    }),

    isProcessing() {
      return (
        get(this.passwordResetCodeSending, 'requesting')
        || get(this.passwordResetCodeVerifying, 'requesting')
        || get(this.passwordResetting, 'requesting')
      );
    },
  },

  watch: {
    // eslint-disable-next-line func-names
    'form.confirmCode': function(newCode) {
      this.form.confirmCode = newCode.toUpperCase();
    },
  },

  methods: {
    async handleResetPassword() {
      const valid = await this.$refs[`step${this.currentStep + 1}Validator`].validate();

      if (!valid) return;

      switch (this.currentStep) {
        case 0:
          this.sendPasswordResetCode();
          break;

        case 1:
          this.verifyPasswordResetCode();
          break;

        case 2:
          this.resetPassword();
          break;

        default:
          break;
      }
    },

    async sendPasswordResetCode() {
      await this.$store.dispatch('sendPasswordResetCode', { email: this.form.email });
      const { status } = this.passwordResetCodeSending;
      if (status === 'success') {
        this.currentStep += 1;
        return;
      }
      const { error } = this.passwordResetCodeSending;
      const { status: responseStatus } = error;

      switch (responseStatus) {
        case 404:
          this.$toast.error('User not found or services has problem.Please try again!');
          break;

        default:
          this.$toast.error('An error occurred while processing!');
      }
    },

    async verifyPasswordResetCode() {
      const userId = get(this.passwordResetCodeSending, 'result.userId');

      await this.$store.dispatch('verifyPasswordResetCode', {
        code: this.form.confirmCode,
        userId,
      });
      const { status } = this.passwordResetCodeVerifying;
      if (status === 'success') {
        this.currentStep += 1;
        return;
      }
      const { error } = this.passwordResetCodeVerifying;
      const { status: responseStatus } = error;

      switch (responseStatus) {
        case 400:
          this.$toast.error('Wrong code! Please try again');
          break;

        default:
          this.$toast.error('An error occurred while processing!');
      }
    },

    async resetPassword() {
      const userId = get(this.passwordResetCodeSending, 'result.userId');

      await this.$store.dispatch('resetPassword', {
        password: this.form.password,
        userId,
      });
      const { status } = this.passwordResetting;
      if (status === 'success') {
        this.currentStep += 1;
        return;
      }
      const { error } = this.passwordResetting;
      const { status: responseStatus } = error;

      switch (responseStatus) {
        case 400:
          this.$toast.error('Invalid password! Please try again');
          break;

        default:
          this.$toast.error('An error occurred while processing!');
      }
    },
  },
};
</script>

<style scoped>
.main-container {
  background: linear-gradient(235deg, #f699ffaf, #7cd6ec);
}

.title {
  color: rgb(48, 113, 129);
  background: linear-gradient(235deg, #009ee7, #ff0aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 10px #444444d3;
  font-size: 30pt;
}

.step-bar-container {
  height: fit-content;
}

.form-step {
  border-radius: 10px;
  background-color: rgba(252, 252, 252, 0.486);
  margin: 0 10%;
  min-height: 400px;
}

.rounded-form {
  border-radius: calc((1.5em + 0.75rem + 2px) / 2);
}

.btn-submit {
  height: 78px !important;
}

@media (max-width: 768px) {
  .form-step {
    margin: 0;
  }
}
</style>
