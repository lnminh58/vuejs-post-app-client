<template>
  <div class="position-relative post">
    <slot name="top"></slot>
    <div class="text-center img-container">
      <img
        :src="_.get(post, 'media[0].source')"
        class="img-fluid type-button"
        @click="$emit('onOpenDetail')"
        @click.middle="$emit('onOpenDetail')"
        :style="{ height: imageHeight || 'auto' }"
      />
    </div>

    <div class="post-detail p-2 text-secondary">
      <span class="font-weight-bold d-block">{{ _.get(post, 'title') }}</span>
      <div>
        <span>{{ _.get(post, '__meta__.totalLikeds', 0) }} <i class="fa fa-heart mr-3"></i></span>
        <span>{{ _.get(post, 'view', 0) }} <i class="fa fa-eye"></i></span>
      </div>

      <span class="block-with-text">
        {{ _.get(post, 'description') }}
      </span>
      <div class="d-flex justify-content-between align-items-center">
        <span class="font-weight-bold">In: {{ _.get(post, 'category.name') }}</span>
        <a
          class="btn btn-link ml-auto"
          target="_blank"
          :href="`${post.link}`"
          @click="$emit('onOpenLinking')"
          @click.middle="$emit('onOpenLinking')"
        >
          <i class="fa fa-link"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    post: {
      type: Object,
    },
    imageHeight: {
      type: String
    }
  },
};
</script>

<style scoped>
.img-container {
  background-color: rgba(200, 200, 200, 0.2);
}
.block-with-text {
  /* fallback for no-webkit support */
  display: block;
  display: -webkit-box;
  min-height: 3rem;
  line-height: 1.5rem;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post {
  box-shadow: 3px 3px 5px rgba(200, 200, 200, 0.2);
  border: rgba(146, 146, 146, 0.1) 1px solid;
}
.post-image {
  object-fit: cover;
}

.post-detail {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.9);
  width: 100%;
  height: 110px;
  overflow: hidden;
  -webkit-transition: height 0.4s; /* For Safari 3.1 to 6.0 */
  transition: height 0.4s;
}

.post-detail:hover {
  height: 200px;
}

.type-button:hover {
  cursor: pointer;
}
</style>
