<template>
  <div class="container-fluid message-container">
    <div class="row h-100">
      <div class="col-3"></div>
      <div class="col-9 d-flex flex-column border-left">
        <div class="flex-fill">
          <div class="row">
            <div
              class="col-10 mt-1 d-flex flex-row align-items-center"
              :class="{ 'ml-auto': message.userId === _.get(currentUser, 'id') }"
              v-for="(message, idx) in messages"
              :key="idx"
            >
              <div
                class="d-inline mes-avatar-container mr-1"
                v-if="message.userId !== _.get(currentUser, 'id')"
              >
                <img
                  :src="_.get(message, 'avatarUrl')"
                  class="mes-avatar"
                  v-if="message.userId !== _.get(messages, `${[idx + 1]}.userId`)"
                />
              </div>
              <div
                class="flex-fill d-flex"
                :class="{ 'justify-content-end': message.userId === _.get(currentUser, 'id') }"
              >
                <span class="bg-primary text-light px-3 badge-pill">
                  {{ _.get(message, 'message') }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex">
          <input v-model="message" type="text" class="form-control mb-2" />
          <button class="btn btn-outline-info mb-2 ml-3" @click="sendMessage">send</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { get } from 'lodash';
import moment from 'moment';

import ws from '@/chat';
import { createPrivateRoomChat } from '@/utils/chat';

export default {
  data() {
    return {
      chat: null,
      message: '',
      topic: null,
    };
  },

  computed: {
    ...mapGetters({
      currentUser: 'currentUser',
      profile: 'userProfile',
      messages: 'messages',
    }),
  },

  async mounted() {
    this.topic = createPrivateRoomChat(4, 7);
    this.chat = ws.subscribe(this.topic);
    this.chat.on('ready', () => {
      console.log('ready');
    });

    this.chat.on('error', error => {
      console.log('error chat', error);
    });

    this.chat.on('close', () => {
      console.log('closed');
    });

    this.chat.on('message', this.onReceiveMessage);

    await this.$store.dispatch('getMessageByConversation', { page: 1 });
  },

  methods: {
    sendMessage() {
      this.chat.emit('message', { message: this.message, userId: this.currentUser.id });
      this.$store.dispatch('sendMessage', {
        message: this.message,
        userId: this.currentUser.id,
        createdAt: moment().format(),
        avatarUrl: get(this.profile, 'avatarUrl'),
        username: this.currentUser.username,
      });
    },

    onReceiveMessage(message) {
      this.$store.dispatch('receiveMessage', message);
    },
  },
};
</script>

<style scoped>
.message-container {
  height: calc(100vh - 50px);
}

.mes-avatar-container {
  width: 25px;
  height: 25px;
}
.mes-avatar {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
