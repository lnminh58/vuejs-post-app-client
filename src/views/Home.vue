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
    <modal
      name="post-detail"
      height="auto"
      width="1150px"
      :draggable="true"
      transition="nice-modal-fade"
      :delay="100"
      classes="bg-transparent px-5"
      :clickToClose="false"
    >
      <i
        class="fa fa-3x fa-times-circle post-detail-close type-button"
        @click="$modal.hide('post-detail')"
      ></i>
      <div class="bg-light p-3 my-2 post-detail-container position-relative">
        <div class="position-relative mb-5">
          <div class="text-center img-container">
            <img :src="_.get(postDetail, 'media[0].source')" class="img-fluid post-detail-image" />
          </div>

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
                height="80px"
                width="80px"
                style="object-fit: cover"
                class="rounded-circle shadow border border-light m-1"
              />
              <div class="mt-1 ml-2">
                <span class="font-weight-bold d-block">{{
                  _.get(postDetail, 'user.username')
                }}</span>
                <span class="small font-weight-bold type-button"
                  >In: {{ _.get(postDetail, 'category.name') }}</span
                >
                <span class="small d-block">{{
                  moment(_.get(postDetail, 'createdAt')).format('YYYY-MM-DD HH:mm')
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <span class="font-weight-bold d-block text-secondary lead">
          {{ _.get(postDetail, 'title') }}
        </span>
        <div class="d-flex flex-row justify-content-between">
          <div>
            <span
              v-for="(hashtag, idx) in _.get(postDetail, 'hashtags', [])"
              :key="_.get(hashtag, 'id')"
              class="badge badge-pill badge-secondary type-button"
              :class="{ 'ml-2': idx > 0 }"
            >
              {{ _.get(hashtag, 'tag') }}
            </span>
          </div>
          <div>
            <span
              >{{ _.get(postDetail, '__meta__.totalLikeds', 0) }} <i class="fa fa-heart mr-3"></i
            ></span>
            <span>{{ _.get(postDetail, 'view', 0) }} <i class="fa fa-eye"></i></span>
          </div>
        </div>
        <p class="lead text-justify">
          {{ _.get(postDetail, 'description') }}
        </p>
        <a
          class="btn btn-block btn-info text-light"
          :href="`${_.get(postDetail, 'link')}`"
          target="_blank"
          @click="handleClickOnLinking(postDetail.id)"
          @click.middle="handleClickOnLinking(postDetail.id)"
          >GO TO ORIGIN THREAD</a
        >
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

    handleOpenPostDetail(postId) {
      console.log(postId);
      this.$store.dispatch('openPostDetail', { postId });
      this.$modal.show('post-detail');
    },

    async toogleLikePost(params) {
      await this.$store.dispatch('toogleLikePost', params);
      console.log(this.postDetail);
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
  left: 10px;
  text-shadow: 1px 1px 5px #c5c5c588;
  z-index: 1002;
  color: white;
  width: 47px;
  height: 47px;
  text-align: center;
  border-radius: 50%;
  background-color: #333;
}

.type-button:hover {
  cursor: pointer;
}
.post-container {
  height: calc(100vh - 170px);
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
