<template>

  <div>
    <SearchHeader
      v-model="selectedSuggestion"
      @executeSearch="doSearch"
      :searchInProgress="searchInProgress"
      @resetSearch="resetSearch"
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

    doSearch(searchQuery) {
      const q = (searchQuery.query == null) ? '' : searchQuery.query
      var self = this;
      this.searchInProgress = true;
      this.searchResults = [];
      console.log("Sending query ",q," to sever")

      return new Promise((resolve, reject) => {
        api
          .get("/search", {
            params: {
              query: q != null ? q : "",
            },
          })
          .then((response) => {

            resolve(response.data);

            console.log("Received search result in client: ",JSON.stringify(response.data))

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
