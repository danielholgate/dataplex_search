<template>

  <div>
    <SearchHeader
      @executeSearch="doSearch"
      :searchInProgress="searchInProgress"
      @resetSearch="resetSearch"
      @updateMetadataStatus="updateMetadataStatus"
      @userEnteringSearchText="userEnteringSearchText"
    />
  </div>
  <div>

    <div v-if="thereAreResults">
      <SearchResults :results="searchResults" />
    </div>
    <div v-else-if="!thereAreResults && !searchIsReset">
      <div class="text-h5 noresults">No results found</div>
    </div>
  </div>

</template>

<style scope="local">
.noresults {
  padding-left: 3em;
}
</style>

<script setup>
import { reactive } from 'vue';
</script>
<script>
import SearchHeader from "../components/SearchHeader.vue";
import SearchResults from "../components/SearchResults.vue";
import { api } from "src/boot/axios";

export default {
  name: "SearchPage",
  components: {
    SearchHeader,
    SearchResults,
  },

  data() {
    return {
      Lakes: [],
      Projects: [],
      searchResults: [],
      searchInProgress: false,
      getMetadataInResults: false,
      suggestMode: false,
      searchIsReset: true,
      selectedSuggestion: [],
      suggestions : []
    };
  },
  watch: {
  },
  computed: {
    thereAreResults() {
      return this.searchResults != null && this.searchResults.length > 0;
    },
  },
  async mounted() {
    //this.listProjects()
  },
  methods: {
    resetSearch() {
      this.searchIsReset = true
    },
    // If user entering new search text, remove "no results" from previous
    userEnteringSearchText() {
      console.log("received userEnteringSearchText. " + JSON.stringify(this.searchResults))
      if ( this.searchResults == null || this.searchResults.length < 1 ) {
        this.resetSearch()
      }
    },
    getLakes() {
      return new Promise((resolve, reject) => {
        api
          .get("/search", {
            params: {},
          })
          .then(async (response) => {
            resolve(response.data);
          })
          .catch((error) => {
            reject(error.response);
          });
      });
    },
    updateMetadataStatus(newVal) {
        this.getMetadataInResults = newVal.status
    },
    doSearch(searchQuery) {

      //console.log("SearchPage", "1a Sending search query to server " + JSON.stringify(searchQuery))
      const q = (searchQuery.query == null) ? '' : searchQuery.query.trim()
      const getMetadata = this.getMetadataInResults
      var self = this;
      this.searchInProgress = true
      this.searchResults = [];
      console.log("SearchPage","1b Sending query '", q ,"' to server")

      return new Promise((resolve, reject) => {
        api
          .get("/search", {
            params: {
              query: q != null ? q : "",
              metadata: getMetadata
            },
          })
          .then((response) => {

            resolve(response.data);

        //    console.log("Received search result in client: ",JSON.stringify(response.data))

            self.searchIsReset = false;
            self.searchInProgress = false;

            if (response.data != null && response.data != "") {
              self.searchResults = response.data;
            } else {
              self.searchResults = [];
            }

          })
          .catch((error) => {
            reject(error.response);
          });
      });
    },
  },
};
</script>
