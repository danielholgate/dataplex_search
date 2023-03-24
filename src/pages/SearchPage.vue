<template>
  <div>
    <SearchHeader v-model="searchInputValue" @executeSearch="doSearch" :inputText="searchInputValue" :searchInProgress="searchInProgress" @resetSearch="resetSearch" />
  </div>
  <div>

    <div v-if="searchIsReset">
      <SearchResults v-show="thereAreResults" :results="searchResults" />
    </div>
    <div v-else-if="thereAreResults">
      <SearchResults :results="searchResults" />
    </div>
    <div v-else-if="!thereAreResults && ! searchIsReset">
      <div class="text-h5 noresults">No results found</div>
    </div>

  </div>

</template>

<style scope="local">
.noresults {
  padding-left: 3em;
}
</style>

<script>
import SearchHeader from "../components/SearchHeader.vue";
import SearchResults from "../components/SearchResults.vue";
import { api } from "src/boot/axios";

export default {
  name: "SearchPage",
  components: { SearchHeader, SearchResults },
  data() {
    return {
      searchInputValue: "",
      Lakes: [],
      searchResults: [],
      searchInProgress: false,
      searchIsReset: true
    };
  },
  computed: {
  thereAreResults() {
    return ( this.searchResults != null && this.searchResults.length > 0)
  }
},
  methods: {
    resetSearch() {
      console.log("resetting search")
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
    doSearch() {
      var self = this;
      this.searchInProgress = true
      this.searchResults = []
      return new Promise((resolve, reject) => {
        api
          .get("/search", {
            params: {"query": self.searchInputValue != null ? self.searchInputValue : '' }
          })
          .then((response) => {
            resolve(response.data);
          //  console.log("Results: " + JSON.stringify(response.data));

            if (response.data != null && response.data != "") {
              self.searchResults = response.data;
            } else {
              self.searchResults = [];
            }
            self.searchIsReset = false
            self.searchInProgress = false
          })
          .catch((error) => {
            reject(error.response);
          });
      });
    },
  },
};
</script>
