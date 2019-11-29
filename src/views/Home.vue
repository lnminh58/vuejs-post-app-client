<template>
  <div class="container-fluid">
    <div class="row my-3 no-gutters px-md-5">
      <div class="form-group col-md-4 ml-auto pl-md-2">
        <input
          type="text"
          class="form-control"
          v-model="search"
          placeholder="Search a post"
          @input="debounceSearchPost"
        />
      </div>
      <div class="form-group col-md-4 pl-md-2">
        <select v-model="postOrder" class="form-control" @change="handleChangeOrder">
          <option :value="POST_ORDER.newest">Newest</option>
          <option :value="POST_ORDER.popular">Popular</option>
        </select>
      </div>
    </div>
    <div class="row my-3 post-container px-md-5" @scroll="onScroll">
      <div
        class="col-12 col-md-4 mx-auto mx-md-0 p-2"
        v-for="post in publicPosts"
        :key="_.get(post, 'id')"
      >
        <post-item :post="post" @onOpenLinking="handleClickOnLinking(post.id)">
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
              <button
                class="btn btn-link"
                @click="
                  toogleLikePost({
                    postId: _.get(post, 'id'),
                    hasLiked: !!_.get(post, '__meta__.isUserLiked'),
                  })
                "
              >
                <i
                  class="fa fa-heart"
                  :class="{
                    'text-danger': !!_.get(post, '__meta__.isUserLiked'),
                    'text-secondary': !_.get(post, '__meta__.isUserLiked'),
                  }"
                ></i>
              </button>
            </div>
          </div>
        </post-item>
      </div>
      <div class="col-12 text-center" v-if="_.get(publicPost, 'requesting', false)">
        <div class="spinner-grow mt-3" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { get, debounce } from 'lodash';

import PostItem from '@/components/PostItem.vue';
import { POST_ORDER } from '@/constants/defaultValues';

export default {
  data() {
    return {
      postOrder: POST_ORDER.newest,
      search: '',
      POST_ORDER,
      debounceSearchPost: debounce(this.handleSearchPost, 800)
    };
  },
  computed: {
    ...mapState({
      publicPost: state => get(state, 'post.publicPost'),
    }),
    ...mapGetters({
      currentUser: 'currentUser',
      publicPosts: 'publicPosts',
    }),
  },
  components: {
    PostItem,
  },
  mounted() {
    this.getPosts({ page: 1 });
  },
  methods: {
    onScroll({ target: { scrollTop, clientHeight, scrollHeight } }) {
      if (scrollTop + clientHeight >= scrollHeight) {
        this.handleLoadMorePost();
      }
    },

    handleChangeOrder() {
      this.getPosts({ page: 1 });
    },

    handleSearchPost() {
      this.getPosts({ page: 1 });
    },

    getPosts({ page = 1 }) {
      this.$store.dispatch('getPosts', { page, orderBy: this.postOrder, q: this.search });
    },

    handleClickOnLinking(postId) {
      this.$store.dispatch('openPostLinking', { postId });
    },

    toogleLikePost(params) {
      this.$store.dispatch('toogleLikePost', params);
    },

    async handleLoadMorePost() {
      const currentPage = get(this.publicPost, 'result.page');
      const lastPage = get(this.publicPost, 'result.lastPage');
      const requesting = get(this.publicPost, 'requesting');

      if (currentPage < lastPage && !requesting) {
        await this.getPosts({ page: currentPage + 1 });
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
  height: calc(100vh - 170px);
  overflow-y: scroll;
}
</style>
