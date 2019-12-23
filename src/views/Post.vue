<template>
  <div class="container">
    <div class="row my-3 no-gutters">
      <router-link class="btn btn-outline-info mr-auto" to="post/post-edit">
        Post new...
      </router-link>
    </div>
    <div class="row my-3 post-container" @scroll="onScroll">
      <div
        class="col-12 col-md-4 mx-auto mx-md-0 p-2 post-item-container"
        v-for="post in myPosts"
        :key="_.get(post, 'id')"
      >
        <post-item
          :post="post"
          imageHeight="300px"
          @onOpenDetail="handleOpenPostDetail(post.id)"
        >
          <div slot="top" class="dropdown action d-flex">
            <button
              type="button"
              class="btn btn-link p-0 ml-auto mr-2"
              :id="`action-${post.id}`"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i class="text-secondary fa fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu" :aria-labelledby="`action-${post.id}`">
              <a class="btn btn-block m-0 btn-link text-secondary">Edit</a>
              <a class="btn btn-block m-0 btn-link text-danger" @click="handleDeletePost(post.id)">
                Delete
              </a>
            </div>
          </div>
        </post-item>
      </div>
      <div class="col-12 text-center" v-if="_.get(myPost, 'requesting', false)">
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
      myPost: state => get(state, 'post.myPost'),
    }),
    ...mapGetters({
      currentUser: 'currentUser',
      myPosts: 'myPosts',
    }),
  },
  components: {
    PostItem,
  },
  mounted() {
    this.$store.dispatch('getCategories');
    this.$store.dispatch('getMyPosts', { page: 1, userId: get(this.currentUser, 'id') });
  },
  methods: {
    async handleDeletePost(postId) {
      await this.$store.dispatch('deletePost', { postId });
    },

    onScroll({ target: { scrollTop, clientHeight, scrollHeight } }) {
      if (scrollTop + clientHeight >= scrollHeight) {
        this.handleLoadMorePost();
      }
    },

    handleOpenPostDetail(postId) {
      this.$router.push(`/post-detail/${postId}`);
    },

    async handleLoadMorePost() {
      const currentPage = get(this.myPost, 'result.page');
      const lastPage = get(this.myPost, 'result.lastPage');
      const requesting = get(this.myPost, 'requesting');

      if (currentPage < lastPage && !requesting) {
        await this.$store.dispatch('getMyPosts', {
          page: currentPage + 1,
          userId: get(this.currentUser, 'id'),
        });
      }
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
  height: calc(100vh - 137px);
  overflow-y: scroll;
}
</style>
