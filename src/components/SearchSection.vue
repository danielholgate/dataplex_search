<template>
    <SearchHeader v-model="searchInputValue" @submit="handleFormSubmit"/>
    <!---
    <div v-if="searchState.wasSearched" class="sui-layout-body">
      <div class="sui-layout-body__inner">
        <div class="sui-layout-sidebar">
          <SearchSort v-show="thereAreResults" v-model="sortBy" />
        </div>
        <div class="sui-layout-main">
          <div class="sui-layout-main-header">
            <div class="sui-layout-main-header__inner">
              <SearchPagingInfo :search-state="searchState" />
              <SearchResultsPerPage
                v-show="thereAreResults"
                v-model.number="resultsPerPage"
              />
            </div>
          </div>
          <div class="sui-layout-main-body">
            <SearchResults
              v-show="thereAreResults"
              :results="searchState.results"
            />
          </div>
          <div class="sui-layout-main-footer">
            <SearchPagination
              v-show="thereAreResults"
              :total-pages="Math.min(searchState.totalPages, 100)"
              :click-handler="setCurrentPage"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
-->
</template>

<script>

//import DataCatalogAPI from "./services/datacatalogAPI"
//import config from "../searchConfig";
//import SearchResults from "./SearchResults";
//import SearchFacet from "./SearchFacet";
//import SearchHeader from "./SearchHeader";
//import SearchPagingInfo from "./SearchPagingInfo";
//import SearchPagination from "./SearchPagination";
//import SearchSort from "./SearchSort";
//import SearchResultsPerPage from "./SearchResultsPerPage";

//const {GoogleAuth} = require('google-auth-library');
//const {DataplexServiceClient} = require('@google-cloud/dataplex');

const driver = new SearchDriver(config);

export default {
  mixins:[DataCatalogAPI],
  components: {
    //SearchResults,
    //SearchFacet,
    SearchHeader
    //SearchPagingInfo,
    //SearchPagination,
    //SearchSort,
    //SearchResultsPerPage
  },
  data() {
    return {
      searchInputValue: "",
      searchState: {},
      race: [],
      rarity: [],
      type: [],
      set: [],
      card_class: [],
      cost: [],
      resultsPerPage: 20,
      sortBy: "relevance"
    };
  }
}
</script>