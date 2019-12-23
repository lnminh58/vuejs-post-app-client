<template>
  <div class="">
    <modal
      name="post-detail-modal"
      height="auto"
      width="1150px"
      :draggable="true"
      transition="nice-modal-fade"
      :delay="100"
      classes="bg-transparent px-5"
      :clickToClose="false"
      v-if="isModal"
    >
      <PostDetailComponent
        :isModal="isModal"
        :postDetail="postDetail"
        @onCloseModal="goBack"
        @onToogleLikePost="
          toogleLikePost({
            postId: _.get(postDetail, 'id'),
            hasLiked: !!parseInt(_.get(postDetail, '__meta__.isUserLiked'), 10),
          })
        "
        @onChooseCategory="handleChooseCategory"
        @onChooseHashtag="handleChooseHashtag"
        @onOpenLinking="handleClickOnLinking(postDetail.id)"
        :isLoading="isLoading"
      />
    </modal>
    <div v-else class="px-3 bg-light">
      <PostDetailComponent
        :isModal="isModal"
        :postDetail="postDetail"
        @onToogleLikePost="
          toogleLikePost({
            postId: _.get(postDetail, 'id'),
            hasLiked: !!parseInt(_.get(postDetail, '__meta__.isUserLiked'), 10),
          })
        "
        @onChooseCategory="handleChooseCategory"
        @onChooseHashtag="handleChooseHashtag"
        @onOpenLinking="handleClickOnLinking(postDetail.id)"
        :isLoading="isLoading"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { get } from 'lodash';

import PostDetailComponent from '../components/PostDetailComponent';

export default {
  data() {
    return {
      isModal: false,
    };
  },
  components: {
    PostDetailComponent,
  },
  async created() {
    this.isModal = get(this.$route, 'query.isModal', false);

    const postId = parseInt(get(this.$route, 'params.id'), 10);
    this.$store.dispatch('getPostDetail', postId);
  },
  mounted() {
    this.$modal.show('post-detail-modal');
  },
  computed: {
    ...mapGetters({
      postDetail: 'postDetail',
    }),
    ...mapState({
      isLoading: state => get(state, 'post.postDetail.requesting'),
    }),
  },

  methods: {
    handleClickOnLinking(postId) {
      this.$store.dispatch('openPostLinking', { postId });
    },

    goBack() {
      this.$modal.hide('post-detail-modal');
      this.$router.go(-1);
    },
    handleChooseHashtag(hashtag) {
      if (this.isModal) {
        this.$modal.hide('post-detail-modal');
      }
      this.$store.dispatch('changeHashtagParam', hashtag);
      this.$router.push('/');
    },

    handleChooseCategory(category) {
      if (this.isModal) {
        this.$modal.hide('post-detail-modal');
      }
      this.$store.dispatch('changeCategoryParam', category);
      this.$router.push('/');
    },

    async toogleLikePost(params) {
      await this.$store.dispatch('toogleLikePost', params);
    },
  },
};
</script>

<style scoped>
.v--modal-overlay {
  z-index: 1001 !important;
}
</style>
