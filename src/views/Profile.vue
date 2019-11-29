<template>
  <div class="container mt-4 pb-5">
    <div class="row">
      <div class="col col-md-6 col-sm-10 col-sx-12 mx-auto">
        <div class="text-left d-flex flex-column">
          <span
            class="d-block text-left h3 text-muted font-weight-light session-header font-italic"
          >
            Information
          </span>
          <div
            class="align-self-center position-relative"
            @mouseenter="isShowEditAvatarButton = true"
            @mouseleave="isShowEditAvatarButton = false"
          >
            <img
              :src="_.get(userProfile, 'avatarUrl') || require('../assets/img/default-avatar.png')"
              alt="avatar"
              class="img-fluid bg-dark rounded-circle avatar"
            />
            <div class="over-img-btn">
              <transition enter-active-class="show" leave-active-class="hide">
                <button
                  v-if="isShowEditAvatarButton"
                  @click="$modal.show('avatarUpload')"
                  class="btn btn-outline-light border-0 btn-sm btn-container"
                >
                  <i class="fa fa-upload fa-2x mx-2 text-secondary"></i>
                </button>
              </transition>
            </div>
            <!-- <div class="positon-absolute over-img-btn">
              <button class="btn btn-outline-secondary btn-sm">Change</button>
            </div> -->
          </div>

          <ValidationObserver ref="updateProfileValidator" v-slot="{ invalid }">
            <TextField
              name="Phone"
              type="text"
              rules="required|numeric|min:10|max:11|"
              v-model="profileForm.phone"
            />
            <TextField
              name="Identify Card Number"
              type="text"
              rules="required|numeric|length:9"
              v-model="profileForm.identifyCardNumber"
            />
            <div class="form-group">
              <label class="text-secondary">Gender</label>
              <select v-model="profileForm.gender" class="custom-select rounded-form">
                <option :value="GENDER.male">Male</option>
                <option :value="GENDER.female">Female</option>
              </select>
            </div>
            <TextField name="Address" type="text" rules="required" v-model="profileForm.address" />
            <TextField name="City" type="text" v-model="profileForm.city" />
            <TextField name="Country" type="text" v-model="profileForm.country" />
            <button
              :disabled="invalid || _.get(profile, 'requesting')"
              @click="updateProfile"
              class="btn mt-5 btn-block btn-outline-secondary rounded-button"
            >
              <div class="spinner-grow spinner-grow-sm" v-if="_.get(profile, 'requesting')" />
              <span v-else>
                Update
              </span>
            </button>
          </ValidationObserver>
        </div>
      </div>
    </div>

    <div class="row mt-5">
      <div class="col col-md-6 col-sm-10 col-sx-12 mx-auto">
        <div class="text-left d-flex flex-column">
          <span
            class="d-block text-left h3 text-muted font-weight-light session-header font-italic"
          >
            Change password
          </span>

          <ValidationObserver ref="updatePasswordValidator" v-slot="{ invalid }">
            <TextField
              name="Old Password"
              type="password"
              rules="min:6"
              v-model="passwordForm.oldPassword"
            >
              <small slot="description" class="text-muted">
                Left this field if not set before.
              </small>
            </TextField>
            <TextField
              name="Password"
              type="password"
              rules="required|min:6"
              vid="confirmation"
              v-model="passwordForm.password"
            />
            <TextField
              name="Confirm Password"
              type="password"
              rules="required|min:6|confirmed:confirmation"
              v-model="passwordForm.confirmPassword"
            />
            <button
              :disabled="invalid || _.get(passwordUpdating, 'requesting')"
              @click="handleChangePassword"
              class="btn mt-5 btn-block btn-outline-secondary rounded-button"
            >
              <div
                class="spinner-grow spinner-grow-sm"
                v-if="_.get(passwordUpdating, 'requesting')"
              />
              <span v-else>
                Update
              </span>
            </button>
          </ValidationObserver>
        </div>
      </div>
    </div>
    <modal
      name="avatarUpload"
      height="auto"
      :draggable="true"
      :clickToClose="!_.get(avatarUpdating, 'requesting')"
      transition="nice-modal-fade"
      :delay="100"
      classes="shadow-lg"
    >
      <drop-file-input
        :file="image"
        @onRemove="handleRemoveImage"
        @onChange="path => (image = path)"
        @onSave="handleChangeAvatar"
      >
        <button
          slot="bottom"
          class="btn btn-outline-secondary mt-2 w-25 mx-auto d-block"
          :disabled="_.get(avatarUpdating, 'requesting')"
          @click="handleChangeAvatar"
        >
          <div class="spinner-grow spinner-grow-sm" v-if="_.get(avatarUpdating, 'requesting')" />
          <span v-else>
            Save
          </span>
        </button>
      </drop-file-input>
    </modal>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { get } from 'lodash';

import TextField from '@/components/TextField.vue';
import DropFileInput from '@/components/DropFileInput.vue';
import { GENDER } from '@/constants/defaultValues';

export default {
  data() {
    return {
      GENDER,
      image: null,
      isShowEditAvatarButton: false,
      profileForm: {
        phone: null,
        identifyCardNumber: null,
        gender: GENDER.male,
        address: null,
        city: null,
        country: null,
      },
      passwordForm: {
        oldPassword: null,
        password: null,
        confirmPassword: null,
      },
    };
  },
  components: {
    TextField,
    DropFileInput,
  },
  mounted() {
    this.initProfileForm();
  },
  computed: {
    ...mapGetters({
      userProfile: 'userProfile',
    }),
    ...mapState({
      profile: state => get(state, 'user.profile'),
      passwordUpdating: state => get(state, 'user.passwordUpdating'),
      avatarUpdating: state => get(state, 'user.avatarUpdating'),
    }),
  },
  watch: {
    userProfile() {
      this.initProfileForm();
    },
  },
  methods: {
    async updateProfile() {
      const valid = await this.$refs.updateProfileValidator.validate();
      if (!valid) return;

      await this.$store.dispatch('updateProfile', this.profileForm);
      const status = get(this.profile, 'status');
      this.$toast[status](`Update profile ${status}!`);
    },

    async handleChangePassword() {
      await this.$store.dispatch('changePassword', this.passwordForm);
      const status = get(this.passwordUpdating, 'status');
      this.$toast[status](`Updating password ${status}!`);
    },

    async handleChangeAvatar() {
      await this.$store.dispatch('updateAvatar', this.image);

      const { status } = this.avatarUpdating;
      this.$toast[status](`Update profile ${status}!`);
      if (status === 'success') {
        this.image = null;
        this.$modal.hide('avatarUpload');
      }
    },

    async handleRemoveImage() {
      if (!get(this.avatarUpdating, 'requesting')) {
        this.image = null;
      }
    },

    initProfileForm() {
      if (this.userProfile) {
        this.profileForm.phone = get(this.userProfile, 'phone');
        this.profileForm.identifyCardNumber = get(this.userProfile, 'identifyCardNumber');
        this.profileForm.gender = get(this.userProfile, 'gender', GENDER.male);
        this.profileForm.address = get(this.userProfile, 'address');
        this.profileForm.city = get(this.userProfile, 'city');
        this.profileForm.country = get(this.userProfile, 'country');
      }
    },
  },
};
</script>

<style scoped>
.session-header {
  border-bottom: #6c757d dashed 1px;
  margin-bottom: 15px;
}

.rounded-form {
  border-radius: calc((1.5em + 0.75rem + 2px) / 2);
  background-color: transparent !important;
  border-color: #6c757d;
}
.rounded-button {
  border-radius: calc((1.5em + 0.75rem + 2px) / 2);
}
.avatar {
  border: #fffaeb 2px solid;
  box-shadow: 0px 5px 20px 2px rgb(131, 131, 131);
  width: 150px;
  height: 150px;
  object-fit: cover;
}

.over-img-btn {
  width: 150px;
  height: 75px;
  border-bottom-left-radius: 75px;
  border-bottom-right-radius: 75px;
  display: flex;
  align-items: flex-end;
  bottom: 0;
  position: absolute;
  overflow: hidden;
}
.btn-container {
  background-color: rgba(255, 255, 255, 0.8);
  height: 80%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.show {
  animation-name: showUp;
  animation-duration: 0.5s;
}

.hide {
  animation-name: hideDown;
  animation-duration: 1s;
}

.file-input {
  height: 300px;
}

@keyframes showUp {
  from {
    opacity: 0;
    height: 0px;
  }
  to {
    opacity: 1;
    height: 80%;
  }
}

@keyframes hideDown {
  to {
    opacity: 0;
    height: 0px;
  }
}

.dropzone-over {
  border: 2px dashed rgb(0, 202, 125) !important ;
}

.dropzone-area {
  width: 100%;
  height: 250px;
  position: relative;
  border: 2px dashed #cbcbcb;
}

.dropzone-area input {
  position: absolute;
  cursor: pointer;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.btn-remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
