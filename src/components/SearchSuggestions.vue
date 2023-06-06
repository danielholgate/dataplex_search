<template>
  <q-select
  ref="suggestionbar"
  v-model="selectedSuggestion"
  hint="Suggestion Selector"
  style="width: 250px; padding-bottom: 32px"
  dropdown-icon="expand_more"
  >
</q-select>

</template>

<script setup>
import { toRefs } from "vue";
const props = defineProps(["suggestions","suggestMode"]);
const { suggestions } = toRefs(props);
const { suggestMode } = toRefs(props);
</script>

<script>
export default {
  name: "SearchSuggestions",
  methods: {},
  prop() {
    suggestOpen: false
  },
  data() {
    return {
      selectedSuggestion: []
    };
  },
watch: {
  suggestMode: {
    handler () {
    console.log("Suggest mode watcher: ")
   // if (val) {
     if (! this.suggestOpen) {
      this.$refs.suggestionbar.showPopup()
      this.suggestOpen = true
     } else {
      this.$refs.suggestionbar.closePopup()
      this.suggestOpen = false
     }
   // } else {

    return true
  }
}
}
}
</script>
