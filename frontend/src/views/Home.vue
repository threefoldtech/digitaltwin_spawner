<template>
  <h1>digitalTwin</h1>
  <img height="200" src="@/assets/threefold_registered.png" alt="">
  <br>
  <span>Start your digitalTwin journey</span> <br> <br>
  <button class="fancyButton" @click="spawn">GO!</button>
</template>

<script lang="ts">
import {defineComponent} from "vue";

import {spawn} from "@/service/spawnService";

export default defineComponent({
  setup() {
    return {
      spawn
    };
  }
});
</script>

<style type="text/css">
.fancyButton {
  border: none;
  color: white;
  background: darkslategray;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
}
.fancyButton:hover {
  background: lightslategray;
}
</style>
