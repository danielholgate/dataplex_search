<template>
  <div>
    <SearchHeader v-model="searchInputValue" @executeSearch="doSearch" />
  </div>

  <q-table
    :rows="searchresults"
    :columns="columns"
    row-key="relativeResourceName"
    color="amber"
  ></q-table>
</template>

<script>
import SearchHeader from "../components/SearchHeader.vue";
import axios from "axios";
import { api } from "src/boot/axios";

export default {
  name: "SearchPage",
  components: { SearchHeader },
  watch: {
    searchInputValue: function (newValue, oldValue) {
      // If "pageData" ever changes, then we will console log its new value.
      console.log(newValue, oldValue);
    },
  },

  data() {
    return {
      searchresults: [],
      Lakes: [{ name: "a" }],
      searchInputValue: "",

      columns: [
        {
          name: "Name",
          required: true,
          label: "Name",
          align: "left",
          field: (row) => row.displayName,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "searchResultSubtype",
          required: true,
          label: "SubType",
          align: "left",
          field: (row) => row.relativeResourceName,
          format: (val) => `${val}`,
          sortable: true,
        },
      ],
    };
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
      console.log("Beginning parent search for: " + this.searchInputValue);
      return new Promise((resolve, reject) => {
        api
          .get("/search", {
            params: { query: self.searchInputValue },
          })
          .then((response) => {
            resolve(response.data);
            console.log("Returning results: " + JSON.stringify(response.data));
            console.log(
              "Returned data is type: " +
                Object.prototype.toString.call(response.data)
            );

            if (response.data != null && response.data != "") {
              self.searchresults = response.data;
            } else {
              self.searchresults = [];
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
