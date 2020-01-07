<template>
  <div class="container-fluid message-content-container p-0">
    <div class="row h-100 no-gutters">
      <div class="col-4 d-flex flex-column">
        <div class="position-relative px-3">
          <input
            type="text"
            class="form-control mt-2 rounded-form"
            v-model="userSearch"
            @input="debounceSearchUser"
          />
          <div class="search-result" v-if="userSearch">
            <div v-if="searchingUsers.length > 0">
              <div
                class="d-flex flex-row align-items-center mt-1"
                v-for="user in searchingUsers"
                :key="user.id"
                @click="handleChooseUser(user)"
              >
                <img
                  :src="
                    _.get(user, 'profile.avatarUrl') || require('../assets/img/default-avatar.png')
                  "
                  class="user-avatar"
                />
                <span class="h5 m-0 ml-2 text-secondary">{{ _.get(user, 'username') }}</span>
              </div>
            </div>
            <div v-else>
              <span class="lead text-secondary">No result</span>
            </div>
          </div>
        </div>

        <div
          class="mt-2 p-2 border-bottom"
          :class="{
            'bg-selected': isNewConversation,
          }"
          v-if="selectedUser"
          @click="handleChooseUser(selectedUser)"
        >
          <div class="d-flex flex-row align-items-center mt-1">
            <img
              :src="
                _.get(selectedUser, 'profile.avatarUrl') ||
                  require('../assets/img/default-avatar.png')
              "
              class="conversation-img"
            />
            <span class="h5 m-0 ml-2 text-secondary">{{ _.get(selectedUser, 'username') }}</span>
          </div>
        </div>
        <div class="mt-3 scroll-container">
          <div
            class="d-flex flex-row align-items-center mt-1 p-2"
            :class="{
              'bg-selected':
                _.get(selectedConversation, 'id') === conversation.id && !isNewConversation,
            }"
            v-for="conversation in conversations"
            :key="_.get(conversation, 'id')"
            @click="onChooseConversation(conversation)"
          >
            <div>
              <img
                :src="_.get(conversation, 'users[0].profile.avatarUrl')"
                class="conversation-img"
                v-if="_.get(conversation, 'users[0].profile.avatarUrl')"
              />
              <div
                v-else
                class="conversation-img-alt d-flex justify-content-center align-items-center"
              >
                <span class="text-light h3 m-0">
                  {{ avatarAlternative(_.get(conversation, 'users[0].username')) }}
                </span>
              </div>
            </div>
            <div class="ml-2">
              <span class="text-secondary font-weight-bold d-block">
                {{ _.get(conversation, 'users[0].username') }}</span
              >
              <span class="d-block overflow-hidden" style="height: 20px">
                {{
                  _.get(conversation, 'lastMessage.user.id') === _.get(currentUser, 'id')
                    ? 'You'
                    : _.get(conversation, 'lastMessage.user.username')
                }}:{{ _.get(conversation, 'lastMessage.content') }}
              </span>
              <span class="small">{{
                moment(_.get(conversation, 'lastMessage.createdAt')).fromNow()
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-8 d-flex flex-column border-left px-2">
        <div
          class="scroll-container"
          v-chat-scroll="{
            always: false,
            smooth: true,
            scrollonremoved: true,
            smoothonremoved: false,
          }"
          @scroll="handleLoadmoreMessage"
        >
          <div class="row pb-5">
            <div class="col-12 text-center" v-if="_.get(messageState, 'requesting', false)">
              <div class="spinner-grow mt-3" />
            </div>
            <div
              class="col-10 d-flex flex-row align-items-center message-container"
              :class="{ 'ml-auto': isCurrentUserMessage(message) }"
              v-for="(message, idx) in messages"
              :key="idx"
            >
              <div class="d-inline mes-avatar-container mr-1" v-if="!isCurrentUserMessage(message)">
                <template v-if="message.userId !== _.get(messages, `${[idx + 1]}.userId`)">
                  <img
                    :src="_.get(message, 'avatarUrl')"
                    class="mes-avatar"
                    v-if="_.get(message, 'avatarUrl')"
                  />
                  <div v-else class="avatar-alt d-flex justify-content-center align-items-center">
                    <span class="text-light">{{
                      avatarAlternative(_.get(message, 'username', ''))
                    }}</span>
                  </div>
                </template>
              </div>
              <div
                class="flex-fill d-flex"
                :class="{ 'justify-content-end': isCurrentUserMessage(message) }"
              >
                <span
                  class="bg-primary text-light px-3 py-1 left-message-content"
                  :class="{
                    'first-left-message-content': isFirstLeftMessage(message, idx),
                    'last-left-message-content': isLastLeftMessage(message, idx),
                    'right-message-content': isCurrentUserMessage(message),
                    'first-right-message-content': isFirstRightMessage(message, idx),
                    'last-right-message-content': isLastRightMessage(message, idx),
                    'single-message-content': isSingleMessage(message, idx),
                  }"
                >
                  {{ _.get(message, 'message') }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex">
          <input
            @keyup.enter="sendMessage"
            v-model="message"
            type="text"
            class="form-control mb-2"
          />
          <button class="btn btn-outline-info mb-2 ml-2" @click="sendMessage">send</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-expressions */

import { mapGetters, mapState } from 'vuex';
import { get, debounce, first } from 'lodash';
import moment from 'moment';

import ws from '@/chat';
import { createPrivateRoomChat } from '@/utils/chat';

export default {
  data() {
    return {
      conversationListener: null,
      chat: null,
      message: '',
      topic: null,
      userSearch: '',
      selectedUser: null,
      debounceSearchUser: debounce(this.handleSearchUser, 500),
      selectedConversation: null,
      isNewConversation: false,
    };
  },

  computed: {
    ...mapState({
      messageState: state => get(state, 'chat.message'),
    }),
    ...mapGetters({
      currentUser: 'currentUser',
      profile: 'userProfile',
      messages: 'messages',
      conversations: 'conversations',
      searchingUsers: 'searchingUsers',
      existConversation: 'existConversation',
    }),
  },

  async mounted() {
    this.subscribeConversations();

    await this.$store.dispatch('getUserConversation', { page: 1 });
    if (this.conversations.length > 0) {
      const lastConversation = first(this.conversations);
      this.selectedConversation = lastConversation;
      await this.$store.dispatch('getMessageByConversation', {
        page: 1,
        conversationId: get(lastConversation, 'id'),
      });

      this.subscribeTopic(lastConversation);
    }
    // this.topic = createPrivateRoomChat(4, 7);
  },

  beforeDestroy() {
    this.chat.close();
  },

  methods: {
    sendMessage() {
      if (this.message.trim() !== '') {
        this.chat.emit('message', { message: this.message, userId: this.currentUser.id });
        this.$store.dispatch('sendMessage', {
          message: this.message,
          userId: this.currentUser.id,
          createdAt: moment().format(),
          avatarUrl: get(this.profile, 'avatarUrl'),
          username: this.currentUser.username,
        });
        this.message = '';
      }
    },

    onReceiveMessage(message) {
      this.$store.dispatch('receiveMessage', message);
    },

    async handleChooseUser(user) {
      this.isNewConversation = true;
      this.userSearch = '';

      const topic = createPrivateRoomChat(this.currentUser.id, user.id);
      await this.$store.dispatch('findExistConversation', topic);
      this.selectedUser = user;
      this.subscribeTopic({ topic });
      if (this.existConversation.length === 0) {
        this.$store.dispatch('clearMessages');
      } else {
        await this.$store.dispatch('getMessageByConversation', {
          page: 1,
          conversationId: get(this.existConversation, '[0].id'),
        });
      }
    },

    async onChooseConversation(conversation) {
      this.isNewConversation = false;

      if (get(this.selectedConversation, 'id') !== conversation.id) {
        this.selectedConversation = conversation;
        await this.$store.dispatch('getMessageByConversation', {
          page: 1,
          conversationId: get(conversation, 'id'),
        });

        this.subscribeTopic(conversation);
      }
    },

    async handleLoadmoreMessage({ target: { scrollTop } }) {
      if (scrollTop <= 0) {
        const requesting = get(this.messageState, 'requesting');
        const lastPage = get(this.messageState, 'result.lastPage');
        const page = get(this.messageState, 'result.page');
        const conversationId = get(this.messageState, 'result.conversationId');
        const lastMessageId = get(this.messageState, 'result.lastMessageId');
        if (requesting || page >= lastPage) {
          return;
        }

        await this.$store.dispatch('getMessageByConversation', {
          page: page + 1,
          conversationId,
          lastMessageId,
        });
      }
    },

    subscribeConversations() {
      this.conversationListener = ws.subscribe(`conversation:${this.currentUser.id}`);
      this.conversationListener.on('ready', () => {
        console.log('ready conversationListener');
      });

      this.conversationListener.on('error', error => {
        console.log('error conversationListener', error);
      });

      this.conversationListener.on('close', () => {
        console.log('closed conversationListener');
      });

      this.conversationListener.on('message', this.onReceiveConversationUpdate);
    },

    subscribeTopic(conversation) {
      this.topic = get(conversation, 'topic');
      const chat = ws.getSubscription(this.topic);

      if (!chat) {
        this.chat && this.chat.close();
        this.chat = ws.subscribe(this.topic);
      } else {
        this.chat = chat;
      }

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
    },

    onReceiveConversationUpdate(conversation) {
      this.$store.dispatch('receiveConversationUpdate', conversation);
      const userId = get(conversation, 'users[0].id');
      const fromUserId = get(conversation, 'lastMessage.user.id');
      if (fromUserId === this.currentUser.id && userId === get(this.selectedUser, 'id')) {
        this.selectedUser = null;
        this.isNewConversation = false;
        this.selectedConversation = conversation;
      }
    },

    avatarAlternative(username) {
      return username
        .split(' ')
        .map(namepart => namepart[0])
        .join('')
        .toUpperCase();
    },

    isCurrentUserMessage(message) {
      return message.userId === get(this.currentUser, 'id');
    },

    isFirstLeftMessage(message, idx) {
      return (
        message.userId !== get(this.messages, `${[idx - 1]}.userId`)
        && message.userId === get(this.messages, `${[idx + 1]}.userId`)
      );
    },

    isLastLeftMessage(message, idx) {
      return (
        message.userId !== get(this.messages, `${[idx + 1]}.userId`)
        && message.userId === get(this.messages, `${[idx - 1]}.userId`)
      );
    },

    isFirstRightMessage(message, idx) {
      return this.isFirstLeftMessage(message, idx) && this.isCurrentUserMessage(message);
    },

    isLastRightMessage(message, idx) {
      return this.isLastLeftMessage(message, idx) && this.isCurrentUserMessage(message);
    },

    isSingleMessage(message, idx) {
      return (
        message.userId !== get(this.messages, `${[idx + 1]}.userId`)
        && message.userId !== get(this.messages, `${[idx - 1]}.userId`)
      );
    },

    handleSearchUser() {
      this.$store.dispatch('searchUserByName', { q: this.userSearch });
    },
  },
};
</script>

<style scoped>
.search-result {
  position: absolute;
  top: 50px;
  left: 5%;
  background-color: white;
  border: 1px #ddd solid;
  border-radius: 5px;
  padding: 10px;
  width: 90%;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 1px white solid;
  box-shadow: 0px 1px 5px #333;
  object-fit: cover;
}

.message-content-container {
  height: calc(100vh - 50px);
}

.message-container {
  margin-top: 1px;
}

.scroll-container {
  flex: 1 1 auto !important;
  /* min-height: 1px; */
  height: 1px;
  overflow-y: scroll;
}

.conversation-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px white solid;
  box-shadow: 0px 1px 5px #333;
  object-fit: cover;
}

.conversation-img-alt {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px white solid;
  box-shadow: 0px 1px 5px #333;
  background: #555;
}

.avatar-alt {
  width: 30px;
  height: 30px;
  background-color: #555;
  border-radius: 50%;
}

.mes-avatar-container {
  width: 30px;
  height: 30px;
}
.mes-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}
.bg-selected {
  background: rgb(211, 211, 211);
}
.left-message-content {
  border-radius: 0px 15px 15px 0px;
}
.first-left-message-content {
  border-radius: 15px 15px 15px 0px;
}
.last-left-message-content {
  border-radius: 0px 15px 15px 15px;
}

.right-message-content {
  border-radius: 15px 0px 0px 15px;
}
.first-right-message-content {
  border-radius: 15px 15px 0px 15px;
}
.last-right-message-content {
  border-radius: 15px 0px 15px 15px;
}
.single-message-content {
  border-radius: 15px;
}

.rounded-form {
  border-radius: calc((1.5em + 0.75rem + 2px) / 2);
}
</style>
