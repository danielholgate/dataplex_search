<template>

  <q-select
  filled
  :options="innerValue"
  v-model="selectedProject"
  option-value="projectId"
  option-label="displayName"
  emit-value
  map-options
  use-input
  hide-selected
  fill-input
  hint="Project Selector"
  style="width: 250px; padding-bottom: 32px"
  >
</q-select>

</template>

<script>
export default {
  name: "ProjectSelector",
  methods: {},
  props: {
    modelValue: {
            type: Object,
            //default: '',
            required: true
        }
  },
  data() {
    return {
      selectedProject: []
    };
  },
  computed: {
     innerValue() {
     return this.modelValue
  }
  },
    model: {
    // Quasar components waits "value" property when Vue3 sends "modelValue"
    // though v-model call.
    // We translate "value" property to "modelValue"
    type: Array,
    prop: 'modelValue'
  }
};
</script>
