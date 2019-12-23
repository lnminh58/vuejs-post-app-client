<template>
  <div>
    <i
      class="fa fa-3x fa-times-circle post-detail-close type-button"
      @click="$emit('onCloseModal')"
      v-if="isModal"
    ></i>
    <div class="bg-light p-3 my-2  position-relative" :class="{ 'post-detail-container': isModal }">
      <div class="mb-5">
        <div class="text-center img-container position-relative">
          <div
            class="img-place-holder d-flex justify-content-center align-items-center"
            v-if="!isImageLoaded"
          >
            <div class="spinner-grow  text-secondary" />
          </div>
          <img
            :src="_.get(postDetail, 'media[0].source')"
            class="img-fluid post-detail-image"
            @load="isImageLoaded = true"
          />

          <button class="btn btn-link btn-save" @click="$emit('onToogleLikePost')">
            <i
              class="fa fa-2x fa-heart"
              :class="{
                'text-danger': !!parseInt(_.get(postDetail, '__meta__.isUserLiked'), 10),
                'text-secondary': !parseInt(_.get(postDetail, '__meta__.isUserLiked'), 10),
              }"
            ></i>
          </button>
        </div>

        <div class="d-flex justify-content-between rounded shadow-lg mx-5 post-user-info">
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
              <span class="font-weight-bold d-block">{{ _.get(postDetail, 'user.username') }}</span>
              <span
                class="small font-weight-bold type-button"
                @click="$emit('onChooseCategory', _.get(postDetail, 'category'))"
                >In:
                <span class="text-info">
                  {{ _.get(postDetail, 'category.name') }}
                </span>
              </span>
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
            class="badge badge-pill badge-secondary type-button hashtag"
            :class="{ 'ml-2': idx > 0 }"
            @click="$emit('onChooseHashtag', hashtag)"
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
        @click="$emit('onOpenLinking')"
        @click.middle="$emit('onOpenLinking')"
        v-if="!isLoading"
      >
        GO TO ORIGIN THREAD
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    postDetail: Object,
    isModal: Boolean,
    isLoading: Boolean
  },
  data() {
    return {
      isImageLoaded: false,
    };
  },
};
</script>

<style scoped>
.post-detail-image {
  max-height: 700px;
  margin: 0 auto;
}

.img-place-holder {
  height: 700px;
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

.type-button:hover {
  cursor: pointer;
}

.btn-save {
  position: absolute;
  top: 0;
  right: 0;
}

.post-user-info {
  margin-top: -65px;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 100000;
  position: absolute;
  left: 0;
  right: 0;
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
</style>
