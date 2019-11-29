<template>
  <div class="bg-light p-2 rounded">
    <div v-if="!image">
      <div
        class="rounded d-flex"
        :class="['dropzone-area', dragging ? 'dropzone-over' : '']"
        @dragover="dragging = true"
        @drop="dragging = false"
        @dragleave="dragging = false"
      >
        <span class="lead align-self-center mx-auto">Drop image here or click to select</span>
        <input type="file" @change="onFileChange" :accept="acceptType" />
      </div>
    </div>
    <div v-else>
      <div class="d-flex justify-content-center">
        <div class="position-relative ">
          <img :src="image" class="img-fluid preview" />
          <button
            class="btn btn-light shadow-sm btn-small btn-remove-image rounded-circle"
            @click="$emit('onRemove')"
          >
            <i class="fa fa-close text-danger"></i>
          </button>
        </div>
      </div>
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    file: {
      type: File,
      default: null,
    },
    acceptType: {
      type: String,
      default: 'image/*',
    },
    exts: {
      type: Array,
      default() {
        return ['jpeg', 'png'];
      },
    },
  },
  data() {
    return {
      image: null,
      dragging: false,
    };
  },
  watch: {
    file(newFile) {
      if (newFile) {
        const reader = new FileReader();
        reader.onload = e => {
          this.image = e.target.result;
        };
        reader.readAsDataURL(this.file);
      } else {
        this.image = '';
      }
    },
  },
  methods: {
    onFileChange(e) {
      const files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      const file = files[0];
      const typeParts = file.type.split('/');
      if (this.acceptType.includes(typeParts[0]) && this.exts.includes(typeParts[1])) {
        this.$emit('onChange', file);
      }
    },
  },
};
</script>

<style scoped>
.dropzone-over {
  border: 2px dashed rgb(0, 202, 125) !important;
}

.dropzone-area {
  width: 100%;
  height: 250px;
  position: relative;
  border: 2px dashed #cbcbcb;
}

.dropzone-area input {
  position: absolute;
  cursor: pointer;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.btn-remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
}

.preview {
  max-height: 500px;
}
</style>
