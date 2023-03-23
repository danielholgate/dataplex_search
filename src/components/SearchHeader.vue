<template>
  <q-input
    class="search-input"
    rounded
    outlined
    v-model="text"
    @keydown.enter.prevent="submit"
    @focus="focus = true"
    @blur="focus = false"
  >
    <template v-slot:prepend>
      <q-icon name="search" type="submit"></q-icon>
    </template>

    <template v-slot:append>
      <q-icon
        name="cancel"
        v-if="text && focus"
        @click.stop.prevent="text = null"
        class="cursor-pointer"
      ></q-icon>
    </template>
  </q-input>
</template>

<style scoped>
.search-input {
  margin-top: 20px;
  padding-left: 50px;
  padding-right: 50px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}
</style>

<script>
export default {
  emits: ["executeSearch"],
  methods: {
    submit() {
      this.$emit("executeSearch");
    },
    cleartext() {
      this.se;
    },
    openUrl(link) {
      return "//" + link;
    },
  },
};
</script>
