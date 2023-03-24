<template>

  <q-input
    class="search-input"
    rounded
    outlined
    clearable
    clear-value="null"
    v-model="text"
    @keydown.enter.prevent="submit"
    @focus="focus = true"
    @blur="focus = false"
  >
    <template v-slot:prepend>
      <div v-if="searchInProgress">
        <q-circular-progress indeterminate rounded size="1em" color="blue" ></q-circular-progress>
      </div>
      <div v-else>
        <q-icon name="search" type="submit"></q-icon>
      </div>
    </template>
  </q-input>

  <!-- experimental-->
  <!---
  <q-select
        filled
        :model-value="text"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="options"
        @filter="filterFn"
        @input-value="setModel"
        hint="Text autocomplete"
        style="width: 250px; padding-bottom: 32px"
      >
  -->

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
  emits: ["executeSearch","resetSearch"],
  methods: {
    submit() {
      this.$emit("executeSearch");
    }
  },
  props: {
    searchInProgress: {
      type: Boolean,
      required: true
    },
    inputText: {
      type: String,
      default: 'null'
    }
},
watch: {
    inputText: function (newValue, oldValue) {
      //console.log(newValue, oldValue);
      if (newValue != null && newValue.toLowerCase() == 'tag:') {
        //console.log("Fire tag: selector dropdown..")
      }
      if (newValue == null || newValue.length == 0) {
        this.$emit("resetSearch");
      }
    },
  },
// Interactive autocomplete dropdowns
///  const stringOptions = [
//  'Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'
//].reduce((acc, opt) => {
//  for (let i = 1; i <= 5; i++) {
//    acc.push(opt + ' ' + i)
//  }
//  return acc
//}, [])
};
</script>
