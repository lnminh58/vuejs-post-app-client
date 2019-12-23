<template>
  <div class="container">
    <div class="row my-3 post-container" @scroll="onScroll">
      <div
        class="col-12 col-md-4 mx-auto mx-md-0 p-2 post-item-container"
        v-for="post in likedPosts"
        :key="_.get(post, 'id')"
      >
        <post-item
          :post="post"
          imageHeight="300px"
          @onOpenDetail="handleOpenPostDetail(post.id)"
          @onOpenLinking="handleClickOnLinking(post.id)"
        >
          <div slot="top" class="d-flex justify-content-between">
            <div class="d-flex text-secondary">
              <img
                :src="
                  _.get(post, 'user.profile.avatarUrl') ||
                    require('../assets/img/default-avatar.png')
                "
                alt=""
                height="50px"
                width="50px"
                style="object-fit: cover"
                class="rounded-circle shadow border border-light m-1"
              />
              <div class="mt-1 ml-2">
                <span class="font-weight-bold d-block">{{ _.get(post, 'user.username') }}</span>
                <span class="small d-block">{{
                  moment(_.get(post, 'createdAt')).format('YYYY-MM-DD HH:mm')
                }}</span>
              </div>
            </div>
            <div class="d-flex flex-column justify-content-center mr-2">
              <button class="btn btn-link" @click="removeLikedPost(_.get(post, 'id'))">
                <i class="fa fa-heart text-danger"></i>
              </button>
            </div>
          </div>
        </post-item>
      </div>
      <div class="col-12 text-center" v-if="_.get(likedPost, 'requesting', false)">
        <div class="spinner-grow mt-3" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { get } from 'lodash';

import PostItem from '@/components/PostItem.vue';

export default {
  computed: {
    ...mapState({
      likedPost: state => get(state, 'post.likedPost'),
    }),
    ...mapGetters({
      currentUser: 'currentUser',
      likedPosts: 'likedPosts',
    }),
  },
  components: {
    PostItem,
  },
  async mounted() {
    await this.$store.dispatch('getLikedPost', { page: 1, userId: get(this.currentUser, 'id') });
  },

  methods: {
    handleOpenPostDetail(postId) {
      this.$router.push(`/post-detail/${postId}`);
    },

    onScroll({ target: { scrollTop, clientHeight, scrollHeight } }) {
      if (scrollTop + clientHeight >= scrollHeight) {
        this.handleLoadMorePost();
      }
    },

    handleClickOnLinking(postId) {
      this.$store.dispatch('openPostLinking', { postId });
    },

    async handleLoadMorePost() {
      const currentPage = get(this.likedPost, 'result.page');
      const lastPage = get(this.likedPost, 'result.lastPage');
      const requesting = get(this.likedPost, 'requesting');

      if (currentPage < lastPage && !requesting) {
        await this.$store.dispatch('getLikedPost', {
          page: currentPage + 1,
          userId: get(this.currentUser, 'id'),
        });
      }
    },

    removeLikedPost(postId) {
      this.$modal.show('confirm-dialog', {
        title: 'Before remove',
        content: 'Are you want to remove it from bookmark list?',
        pressYes: () => {
          this.handleUnlikePost(postId);
        },
        pressNo: () => {
          this.$modal.hide('confirm-dialog');
        },
      });
    },

    async handleUnlikePost(postId) {
      this.$store.dispatch('toogleLikePost', { postId, hasLiked: true });
      this.$modal.hide('confirm-dialog');
    },
  },
};
</script>

<style scoped>
.action {
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.5);
  width: 100%;
  height: 25px;
}

.post-container {
  height: calc(100vh - 80px);
  overflow-y: scroll;
}
</style>
