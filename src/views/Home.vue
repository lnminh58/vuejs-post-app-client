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
                    hasLiked: !!parseInt(_.get(post, '__meta__.isUserLiked'), 10),
                  })
                "
              >
                <i
                  class="fa fa-heart"
                  :class="{
                    'text-danger': !!parseInt(_.get(post, '__meta__.isUserLiked'), 10),
                    'text-secondary': !parseInt(_.get(post, '__meta__.isUserLiked'), 10),
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
    <modal
      name="post-detail"
      height="auto"
      width="1000px"
      :draggable="true"
      transition="nice-modal-fade"
      :delay="100"
      classes="bg-light mt-4"
    >
      <div class="bg-light p-4 my-2 post-detail-container">
        <div class="position-relative mb-5">
          <img :src="_.get(postDetail, 'media[0].source')" class="img-fluid post-image" />

          <button
            class="btn btn-link btn-save"
            @click="
              toogleLikePost({
                postId: _.get(postDetail, 'id'),
                hasLiked: !!parseInt(_.get(postDetail, '__meta__.isUserLiked'), 10),
              })
            "
          >
            <i
              class="fa fa-2x fa-heart"
              :class="{
                'text-danger': !!parseInt(_.get(postDetail, '__meta__.isUserLiked'), 10),
                'text-secondary': !parseInt(_.get(postDetail, '__meta__.isUserLiked'), 10),
              }"
            ></i>
          </button>

          <div class="d-flex justify-content-between rounded shadow-lg mx-3 post-user-info">
            <div class="d-flex text-secondary px-3 py-2">
              <img
                :src="
                  _.get(postDetail, 'user.profile.avatarUrl') ||
                    require('../assets/img/default-avatar.png')
                "
                alt=""
                height="80px"
                width="80px"
                style="object-fit: cover"
                class="rounded-circle shadow border border-light m-1"
              />
              <div class="mt-1 ml-2">
                <span class="font-weight-bold d-block">{{
                  _.get(postDetail, 'user.username')
                }}</span>
                <span class="small d-block">{{
                  moment(_.get(postDetail, 'createdAt')).format('YYYY-MM-DD HH:mm')
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <span class="lead py-5">
          {{ _.get(postDetail, 'description') }}
        </span>
      </div>
    </modal>
  </div>
</template>

<script>
/* eslint-disable prefer-destructuring */
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
      debounceSearchPost: debounce(this.handleSearchPost, 800),
    };
  },
  computed: {
    ...mapState({
      publicPost: state => get(state, 'post.publicPost'),
    }),
    ...mapGetters({
      currentUser: 'currentUser',
      publicPosts: 'publicPosts',
      postDetail: 'postDetail',
    }),
  },
  components: {
    PostItem,
  },
  async mounted() {
    await this.getPosts({ page: 1 });
    this.$modal.show('post-detail');
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
      return this.$store.dispatch('getPosts', { page, orderBy: this.postOrder, q: this.search });
    },

    handleClickOnLinking(postId) {
      this.$store.dispatch('openPostLinking', { postId });
    },

    async toogleLikePost(params) {
      await this.$store.dispatch('toogleLikePost', params);
      console.log(this.postDetail, this.publicPosts);
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
.post-detail-container {
  max-height: 80vh;
  overflow-Y: scroll;
}

.post-user-info {
  margin-top: -50px;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 100000;
  position: absolute;
  left: 0;
  right: 0;
}
.btn-save {
  position: absolute;
  top: 0;
  right: 0;
}

.btn-save i {
  text-shadow: 1px 1px 10px #00000088;
}
</style>
