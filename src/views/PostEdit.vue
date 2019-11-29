<template>
  <div class="container">
    <div class="row my-5">
      <div class="col col-md-8 mx-auto">
        <ValidationObserver ref="postEditorValidation" v-slot="{ invalid }">
          <drop-file-input
            :file="image"
            @onRemove="image = null"
            @onChange="path => (image = path)"
          ></drop-file-input>
          <TextField
            class="mt-3"
            name="Title"
            type="text"
            rules="required|min:10|max:200"
            v-model="postForm.title"
          />
          <div class="form-group">
            <label class="text-secondary">Category</label>
            <select v-model="postForm.categoryId" class="custom-select rounded-form">
              <option
                v-for="category in categories"
                :key="_.get(category, 'id')"
                :value="_.get(category, 'id')"
              >
                {{ _.get(category, 'name') }}
              </option>
            </select>
          </div>
          <text-area
            name="Your feelings"
            rows="6"
            rules="max:1000"
            v-model="postForm.description"
          ></text-area>
          <text-area name="Linking" rows="3" rules="required" v-model="postForm.link"></text-area>
          <TextField
            class="mt-3"
            name="Hashtags"
            type="text"
            placeholder="Mutiple hashtags separate by comma ',' "
            rules="required|min:5|max:100"
            v-model="postForm.hashtags"
          />
          <button
            :disabled="isRequesting"
            @click="handleSavePost"
            class="btn mt-5 btn-block btn-outline-secondary rounded-button"
          >
            <div class="spinner-grow" v-if="isRequesting" />
            <span v-else>
              Save
            </span>
          </button>
        </ValidationObserver>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { get } from 'lodash';

import DropFileInput from '@/components/DropFileInput.vue';
import TextField from '@/components/TextField.vue';
import TextArea from '@/components/TextArea.vue';

export default {
  data() {
    return {
      image: null,
      postForm: {
        title: null,
        description: null,
        link: null,
        hashtags: null,
        categoryId: get(this.categories, '[0].id', 1),
      },
    };
  },
  components: {
    DropFileInput,
    TextField,
    TextArea,
  },
  computed: {
    ...mapState({
      isRequesting: state => get(state, 'post.postSaving.requesting'),
      postSaving: state => get(state, 'post.postSaving'),
    }),
    ...mapGetters({
      categories: 'categories',
    }),
  },
  methods: {
    async handleSavePost() {
      await this.$store.dispatch('savePost', {
        postForm: {
          ...this.postForm,
          hashtags: this.postForm.hashtags.split(',').map(hashtag => hashtag.trim()),
        },
        media: this.image,
      });

      const status = get(this.postSaving, 'status');
      this.$toast[status](`Save ${status}!`);
      if (status === 'success') {
        this.$router.push('/post');
      }
    },
  },
};
</script>

<style scoped>
.rounded-button {
  border-radius: calc((1.5em + 0.75rem + 2px) / 2);
}

.rounded-form {
  border-radius: calc((1.5em + 0.75rem + 2px) / 2);
  background-color: transparent !important;
  border-color: #6c757d;
}
</style>
