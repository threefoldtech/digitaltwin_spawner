<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { login } from "./service/authService";

export default defineComponent({
  setup() {
    return {
      login
    };
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
html{
  background: url(https://www.toptal.com/designers/subtlepatterns/patterns/geometric-leaves.png);
}
</style>
