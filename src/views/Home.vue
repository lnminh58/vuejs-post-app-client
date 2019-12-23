<template>
  <div class="container-fluid">
    <div class="row my-3 no-gutters px-md-5">
      <div class="col-6 col-md-3 d-flex align-items-center justify-content-center">
        <span class="badge-secondary badge-pill px-3 py-1" v-if="hashtag">
          {{ hashtag.tag }}
          <i class="fa fa-close type-button" @click="clearQueryParams({ type: 'hashtag' })"></i>
        </span>
      </div>
      <div class="col-6 col-md-3 d-flex align-items-center justify-content-center" v-if="category">
        In:
        <span class="badge-secondary badge-pill px-3 py-1 ml-1">
          {{ category.name }}
          <i class="fa fa-close type-button" @click="clearQueryParams({ type: 'category' })"></i>
        </span>
      </div>
      <div class="mt-1 col-md-3 ml-auto pl-md-2 d-flex align-items-center">
        <input
          type="text"
          class="form-control"
          v-model="search"
          placeholder="Search a post"
          @input="debounceSearchPost"
        />
      </div>
      <div class="mt-1 col-md-3 pl-md-2 d-flex align-items-center">
        <select v-model="postOrder" class="form-control" @change="handleChangeOrder">
          <option :value="POST_ORDER.newest">Newest</option>
          <option :value="POST_ORDER.popular">Popular</option>
        </select>
      </div>
    </div>
    <div class="post-container" @scroll="onScroll">
      <div
        v-masonry="masoryPostId"
        transition-duration="0.3s"
        item-selector=".masonry-item"
        :horizontal-order="true"
        :origin-top="true"
        stagger="0.01s"
      >
        <div
          v-masonry-tile
          class="masonry-item"
          v-for="post in publicPosts"
          :key="_.get(post, 'id')"
        >
          <post-item
            :post="post"
            @onOpenLinking="handleClickOnLinking(post.id)"
            @onOpenDetail="handleOpenPostDetail(post.id)"
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
      </div>
      <div class="row">
        <div class="col-12 text-center" v-if="_.get(publicPost, 'requesting', false)">
          <div class="spinner-grow mt-3" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable prefer-destructuring */
import { mapGetters, mapState } from 'vuex';
import { get, debounce, isEqual } from 'lodash';

import PostItem from '@/components/PostItem.vue';
import { POST_ORDER } from '@/constants/defaultValues';

export default {
  name: 'home',
  data() {
    return {
      masoryPostId: null,
      postOrder: POST_ORDER.newest,
      search: '',
      POST_ORDER,
      debounceSearchPost: debounce(this.handleSearchPost, 800),
    };
  },
  computed: {
    ...mapState({
      publicPost: state => get(state, 'post.publicPost'),
      hashtag: state => get(state, 'post.postQuery.hashtag'),
      category: state => get(state, 'post.postQuery.category'),
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
    await this.getPosts();
  },

  watch: {
    hashtag(newHashtag, oldHashtag) {
      if (!isEqual(newHashtag, oldHashtag)) {
        this.getPosts();
      }
    },

    category(newCategory, oldCategory) {
      if (!isEqual(newCategory, oldCategory)) {
        this.getPosts();
      }
    },
  },

  methods: {
    onScroll({ target: { scrollTop, clientHeight, scrollHeight } }) {
      if (scrollTop + clientHeight >= scrollHeight) {
        this.handleLoadMorePost();
      }
    },

    handleChangeOrder() {
      this.getPosts();
    },

    handleSearchPost() {
      this.getPosts();
    },

    getPosts({ page = 1 } = {}) {
      return this.$store.dispatch('getPosts', {
        page,
        orderBy: this.postOrder,
        q: this.search,
        hashtagId: get(this.hashtag, 'id'),
        categoryId: get(this.category, 'id'),
      });
    },

    handleClickOnLinking(postId) {
      this.$store.dispatch('openPostLinking', { postId });
    },

    handleOpenPostDetail(postId) {
      this.$router.push(`/post-detail/${postId}`);
    },

    clearQueryParams({ type }) {
      switch (type) {
        case 'hashtag':
          this.$store.dispatch('changeHashtagParam', null);
          break;
        case 'category':
          this.$store.dispatch('changeCategoryParam', null);
          break;

        default:
      }
    },

    async toogleLikePost(params) {
      await this.$store.dispatch('toogleLikePost', params);
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

.img-container {
  background-color: rgba(200, 200, 200, 0.2);
}

.post-detail-close {
  position: absolute;
  top: 30px;
  left: 15px;
  text-shadow: 1px 1px 5px #c5c5c588;
  z-index: 1002;
  color: white;
  width: 47px;
  height: 47px;
  text-align: center;
  border-radius: 50%;
  background-color: #333;
}

.hashtag {
  box-shadow: 0px 1px 6px rgb(105, 105, 105);
}

.type-button:hover {
  cursor: pointer;
}

.post-container {
  height: calc(100vh - 130px);
  overflow-y: scroll;
}
.post-detail-container {
  max-height: 95vh;
  overflow-y: scroll;
  border-top: 10px #f8f9fa solid;
  border-bottom: 10px #f8f9fa solid;
}

.post-user-info {
  margin-top: -65px;
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

.post-detail-image {
  max-height: 700px;
  margin: 0 auto;
}

.v--modal-overlay {
  z-index: 1001 !important;
}

.masonry-item {
  margin-top: 15px;
}

@media (min-width: 576px) {
  .masonry-item {
    max-width: 90%;
    margin-left: calc((100% - 90%) / 2);
  }
}

@media (min-width: 992px) {
  .masonry-item {
    max-width: 47%;
    margin-left: calc((100% - (47% * 2)) / 3);
  }
}

@media (min-width: 1200px) {
  .masonry-item {
    max-width: 32%;
    margin-left: calc((100% - (32% * 3)) / 4);
  }
}
</style>
