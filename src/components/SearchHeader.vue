<template>

  <q-select
    ref="searchinputbar"
    class="search-input"
    use-input
    rounded
    outlined
    clearable
    @keydown.enter.prevent="submit"
    @input-value="filterFn"
    behavior="menu"
    v-model="selectedOptionModel"
    :options=suggestions
  >
    <template v-slot:prepend>
      <div v-if="searchInProgress">
        <q-circular-progress
          indeterminate
          rounded
          size="1em"
          color="blue"
        ></q-circular-progress>
      </div>
      <div v-else>
        <q-icon name="search" type="submit"></q-icon>
      </div>
    </template>
  </q-select>

<!---
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
        <q-circular-progress
          indeterminate
          rounded
          size="1em"
          color="blue"
        ></q-circular-progress>
      </div>
      <div v-else>
        <q-icon name="search" type="submit"></q-icon>
      </div>
    </template>
  </q-input>
  -->
</template>

<style>
.search-input {
  margin-top: 20px;
  padding-left: 50px;
  padding-right: 50px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

i.q-select__dropdown-icon {
  display: none;
}
</style>

<script setup>
//import { toRefs } from "vue";
//const props = defineProps("searchInProgress");
//const { searchInProgress } = toRefs(props);
</script>

<script>

import { ref } from 'vue';
import { api } from "src/boot/axios";

export default {
  name: "SearchHeader",
  emits: [
    "executeSearch",
    "resetSearch"
  ],
  methods: {
    submit() {
      // Hitting enter in suggest mode means just adding choice to end of current text
   //   console.log("User hit enter")
      if ( this.InSuggestMode ) {
    //    console.log("Suggest mode: this.userSearchInput " + this.userSearchInput)
      } else {
        console.log("Searching for: " + this.userSearchInput)
        this.$emit("executeSearch", { query : this.userSearchInput });
      }
    },
    filterFn (val,update) {
  //    console.log("Search bar is now: " + JSON.stringify(val) + " Suggest Mode = " + this.InSuggestMode )
      this.userSearchInput = val.replace(/\s\s+/g, ' ')
    },
    clearSuggestions() {
      this.InSuggestMode = false
      this.suggestions = []
    },
    listSystems() {
      this.InSuggestMode = false;
      this.suggestions= this.dataplex_systems
      this.InSuggestMode = true
    },
    listTypes() {
      this.InSuggestMode = false;
      this.suggestions= this.dataplex_types
      this.InSuggestMode = true
    },
      listTags() {
      var self = this;
      console.log("Calling to get tags. (Tags are currently " + this.suggestions + ")");
      return new Promise((resolve, reject) => {
        api
          .get("/listTags", {
            params: {},
          })
          .then(async (response) => {
            resolve(response.data);
            if (response.data != null && response.data.length != 0) {
              for (item in response.data) {
                  self.suggestions.append(item)
              }
              //self.suggestions = [response.data]
                console.log("Suggestions are now: " + self.suggestions);
              }  else {
                console.log("cleared projects")
              self.Projects = [];
            }
          })
          .catch((error) => {
            reject(error.response);
          });
      });
    },
    listLakes() {
      var self = this;
      return new Promise((resolve, reject) => {
        api
          .get("/listLakes", {
            params: {},
          })
          .then(async (response) => {
            resolve(response.data);
            if (response.data != null && response.data != []) {
              self.searchInputValue = self.searchInputValue + "!!!";
            } else {
              self.lakes = [];
            }
          })
          .catch((error) => {
            reject(error.response);
          });
      });
    },
    listProjects() {
      var self = this;
      return new Promise((resolve, reject) => {
        api
          .get("/listProjects", {
            params: {},
          })
          .then(async (response) => {
            resolve(response.data);
            console.log("Adding projects to dropdown ")
            if (response.data != null && response.data != [] && response.data.length > 0) {
              self.Projects = []
              for (item in response.data) {
                  self.Projects.append(item)
              }
              //self.Projects = response.data
              console.log("Projects now: " + self.Projects);
              }  else {
              self.Projects = [];
            }
          })
          .catch((error) => {
            reject(error.response);
          });
      });
    }
  },

  props: {
    searchInProgress: {
      type: Boolean,
      default: false,
      required: true,
    },
  },

  watch: {
    selectedOptionModel: {
      handler: function(newVal, oldVal) {
          console.log("Drop down option has been selected: " + newVal)
          console.log("Full search text is: " + this.previoususerSearchInput + " " + newVal )
          this.previoususerSearchInput = ''
          this.userSearchInput = this.previoususerSearchInput + newVal
      }
    },
    suggestions: {
      handler: function(newVal, oldVal) {
     // if (newVal !== null && newVal.length > 0)
      console.log("SearchHeader: Available suggested options have changed: " + newVal)
    },
    deep: true
    },
    InSuggestMode: function(newVal,oldVal) {
      if (newVal === true) {
        this.previoususerSearchInput = this.userSearchInput // preserve current text
        console.log("Opening suggestions dropdown..")
        this.$refs.searchinputbar.showPopup()
      } else {
        this.$refs.searchinputbar.hidePopup()
      }
    },
    userSearchInput: function (newValue, oldValue) {
      console.log("userSearchInput is now: " + newValue + " (was " + oldValue + ")")
      console.log("Suggest mode is " + this.InSuggestMode)
      if (newValue !== null && newValue !== '') {
        const lastText = newValue.split(" ").length > 1 ? newValue.split(" ").slice(-1)[0] : newValue
        console.log("Checking input with lastText = " + lastText)
        if ( lastText.toLowerCase() == "tag:") {
          this.listTags();
          return
        }
        if (lastText.toLowerCase() == "lake:") {
          this.listLakes();
          return
        }
        if (lastText.toLowerCase() == "system=") {
          this.listSystems();
          return
        }
        if (lastText.toLowerCase() == "project:") {
          this.listProjects();
          return
        }
        if (lastText.toLowerCase() == "type=") {
          this.listTypes();
          return
        }
      //  if (lastText.length == 0) {
      //    this.$emit("resetSearch");
      //    return
       // }
        if (lastText.toLowerCase() == "project:") {
          this.$emit("listProjects");
          return
        }
        this.clearSuggestions()
      }
      if (newValue == null || newValue.length == 0) this.clearSuggestions()
    },
  },
  data() {
    return {
      suggestions: [],
      InSuggestMode: false,
      selectedOptionModel: ref(null),
      previoususerSearchInput: '',
      userSearchInput : '',
      dataplex_systems : ['system=bigquery','system=cloud_bigtable','system=cloud_pubsub','system=cloud_spanner','system=dataproc_metastore','system=data_catalog','system=dataplex matches'],
      dataplex_types : ['type=table','type=dataset','type=table.view','type=lake','type=zone','type=tag_template','type=entry_group','type=data_stream','type=dataset.linked']
    };
  },
};
</script>
