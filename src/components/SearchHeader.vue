<template>

 <q-checkbox v-model="getMetadataInResults" label="Metadata"></q-checkbox>

  <q-select
    ref="searchinputbar"
    class="search-input"
    use-input
    rounded
    outlined
    clearable
    @keydown.enter.prevent="submit"
    hide-dropdown-icon
    stack-label
    lazy-rules
    @filter="filterFn"
    @input-value="logging"
    behavior="menu"
    v-model="selectedOptionModel"
    :options="localSuggestions"
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
</template>

<style>
.search-input {
  margin-top: 20px;
  padding-left: 50px;
  padding-right: 50px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

</style>


<script>

import { ref } from 'vue';
import { api } from "src/boot/axios";

export default {
  name: "SearchHeader",
  emits: [
    "executeSearch",
    "resetSearch",
    "userEnteringSearchText",
    "updateMetadataStatus"
  ],
  methods: {
    submit() {
      if ( this.InSuggestMode ) {

      } else {
        this.clearSuggestions()
        this.InSuggestMode = false
        this.finalisingSelection = false
        this.$emit("executeSearch", { query : this.userSearchInput, getMetadata : this.getMetadataInResults });
      }
    },

    filterFn (val,update,abort) {

     // console.log("filterFn 1. this.userSearchInput = '" + this.userSearchInput + "' Suggest Mode = ", this.InSuggestMode,"Finalizing =",this.finalisingSelection )
      update(() => {

        if ( this.InSuggestMode ) {
          const needle = this.getLastText(val).toLocaleLowerCase()
          console.log("this.localSuggestions is currently: ", JSON.stringify(this.localSuggestions) )
          this.localSuggestions = this.suggestions.filter(v => v.toLocaleLowerCase().indexOf(needle) > -1)
          console.log("Local suggestions has now populated with " + this.localSuggestions.length, "options: ",this.localSuggestions)

        } else {

          if ( val !== null && val.length > 0 ) {
              this.userSearchInput = val.replace(/\s\s+/g, ' ')
        } else {

        }
        }

        })
    },
    logging(a) {
        this.userSearchInput = a
        this.$emit("userEnteringSearchText")
    },
    clearSuggestions() {
      console.log("Clearing suggestions")
      this.InSuggestMode = false
      this.suggestions = []
    },
    listSystems() {
      this.InSuggestMode = false;
      this.suggestions= this.dataplex_systems
      this.InSuggestMode = true
    },
    listTypes() {
      console.log("In listTypes()")
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
                  self.Projects.append(item.projectId)
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
    },
    getLastText(txt) {
      return txt.split(" ").length > 1 ? txt.split(" ").slice(-1)[0] : txt
    },
    getEarlierText(txt) {
      return txt.substring( 0, txt.lastIndexOf(' '))
    }
  },

  props: {
    searchInProgress: {
      type: Boolean,
      default: false,
      required: true,
    }
  },

  computed: {},
  watch: {
    selectedOptionModel: {
      handler: function(newVal, oldVal) {
        if ( newVal == null ) return // do nothing more
        if ( ! this.finalisingSelection ) {
          this.finalisingSelection = true
          this.clearSuggestions()
          this.InSuggestMode = false
          this.userSearchInput = this.getEarlierText(this.previoususerSearchInput) + " " + newVal + " "
          this.selectedOptionModel = null
        } else {

        }
      }
    },
    suggestions: {
      handler: function(newVal, oldVal) {
     // if (newVal !== null && newVal.length > 0)
      if ( newVal !== null ) {
        this.localSuggestions = newVal
        this.$refs.searchinputbar.showPopup()
      }
      },
    deep: true
    },
    InSuggestMode: function(newVal,oldVal) {
      if (newVal === true) {
        this.previoususerSearchInput = this.userSearchInput // preserve current text
        this.$refs.searchinputbar.showPopup()
      } else {
        this.$refs.searchinputbar.hidePopup()
      }
    },
    getMetadataInResults: function( newVal ) {
        this.$emit("updateMetadataStatus", {status : newVal});
    },
    userSearchInput: function (newValue, oldValue) {
        // console.log("Suggest mode is " + this.InSuggestMode)
      if (newValue !== null && newValue !== '') {
        const lastText = newValue.split(" ").length > 1 ? newValue.split(" ").slice(-1)[0] : newValue
        //console.log("Checking input with lastText = " + lastText)

        if ( this.finalisingSelection ) {
          this.selectedOptionModel = newValue

        } else {

        if ( lastText.toLowerCase().startsWith("tag:"))  {
          this.listTags();
          return
        }
        if (lastText.toLowerCase().startsWith("lake:"))  {
          this.listLakes();
          return
        }
        if (lastText.toLowerCase().startsWith("system="))  {
          this.listSystems();
          return
        }
        if (lastText.toLowerCase().startsWith("project:"))  {
          this.listProjects();
          return
        }
        if (lastText.toLowerCase().startsWith("type=") ) {
          this.listTypes();
          return
        }
        this.clearSuggestions()
            this.finalisingSelection = false
        }
      }
      if (newValue == null || newValue.length == 0) this.clearSuggestions()
    },
  },
  data() {
    return {
      suggestions: [],
      localSuggestions: [],
      getMetadataInResults: false,
      getMetadata: false,
      InSuggestMode: false,
      finalisingSelection: false,
      selectedOptionModel: ref(null),
      previoususerSearchInput: '',
      userSearchInput : '',
      dataplex_systems : ['system=bigquery','system=cloud_bigtable','system=cloud_pubsub','system=cloud_spanner','system=dataproc_metastore','system=data_catalog','system=dataplex matches'],
      dataplex_types : ['type=table','type=dataset','type=table.view','type=lake','type=zone','type=tag_template','type=entry_group','type=data_stream','type=dataset.linked']
    };
  },
};
</script>
