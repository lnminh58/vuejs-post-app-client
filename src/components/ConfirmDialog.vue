<template>
  <div>
    <modal
      name="confirm-dialog"
      height="auto"
      :draggable="true"
      transition="nice-modal-fade"
      :delay="100"
      classes="bg-light"
      :clickToClose="true"
      @before-open="beforeOpen"
    >
      <div>
        <span class=" d-block lead text-info border-bottom text-uppercase px-4 py-2">{{
          title
        }}</span>
        <span class="d-block px-4 py-3 text-secondary">{{ content }}</span>
        <div class="d-flex flex-row">
          <button class="flex-fill btn btn-danger rounded-0" @click="handlePressYes">
            YES
          </button>
          <button
            class="flex-fill flex-fill btn btn-secondary rounded-0"
            @click="handlePressNo"
          >
            NO
          </button>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import { get } from 'lodash';

export default {
  data() {
    return {
      title: '',
      content: '',
      event: null,
    };
  },

  methods: {
    beforeOpen(event) {
      console.log(event);
      this.title = get(event, 'params.title');
      this.content = get(event, 'params.content');
      this.event = event;
    },

    handlePressYes() {
      this.event.params.pressYes();
    },

    handlePressNo() {
      this.event.params.pressNo();
    },
  },
};
</script>

<style scoped></style>
