<template>
  <q-input
    class="search-input"
    rounded
    outlined
    clearable
    clear-value=""
    v-model="text"
    @keydown.enter.prevent="submit"
    @focus="focus = true"
    @blur="focus = false"
  >
    <template v-slot:prepend>
      <div v-if="searchInProgress">
        <q-circular-progress indeterminate rounded size="1em" color="blue" ></q-circular-progress>
      </div>
      <div v-if="!(searchInProgress)">
        <q-icon name="search" type="submit"></q-icon>
      </div>
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
  name: "SearchHeader",
  emits: ["executeSearch","searchInProgress"],
  methods: {
    submit() {
      this.$emit("executeSearch");
    },
    cleartext() {
      this.se;
    }
  },
  props: {
    searchInProgress: {
      type: Boolean,
      required: true
    }
},
};
</script>
