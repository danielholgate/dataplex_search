<template>
  <div>
    <SearchHeader v-model="searchInputValue" @executeSearch="doSearch" :searchInProgress="searchInProgress" />
  </div>

  <div>
    <SearchResults v-show="thereAreResults" :results="searchResults" />
  </div>

</template>

<script>
import SearchHeader from "../components/SearchHeader.vue";
import SearchResults from "../components/SearchResults.vue";
import axios from "axios";
import { api } from "src/boot/axios";

export default {
  name: "SearchPage",
  components: { SearchHeader, SearchResults },
  watch: {
    searchInputValue: function (newValue, oldValue) {
      // If "pageData" ever changes, then we will console log its new value.
      //console.log(newValue, oldValue);
    },
  },

  data() {
    return {
      searchInputValue: "",
      Lakes: [],
      searchResults: [],
      searchInProgress: false
    };
  },
  computed: {
  thereAreResults() {
    return ( this.searchresults != null )
  }
},
  methods: {
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
      return new Promise((resolve, reject) => {
        api
          .get("/search", {
            params: { query: self.searchInputValue },
          })
          .then((response) => {
            resolve(response.data);
            console.log("Results: " + JSON.stringify(response.data));
            //console.log(
            //  "Returned data is type: " +
            //    Object.prototype.toString.call(response.data)
            //);

            if (response.data != null && response.data != "") {
              self.searchResults = response.data;
            } else {
              self.searchResults = [];
            }
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
