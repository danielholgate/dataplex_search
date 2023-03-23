<template>

<div>
 <div v-if="this.resultsExist">
  <q-table
    :rows="results"
    :columns="columns"
    :pagination="initialPagination"
    row-key="relativeResourceName">
    <template v-slot:no-data>
      <div>No results</div>
    </template>
  </q-table>
  </div>
</div>

<a>.</a>

</template>

<style scoped>
.q-table {
  padding-left: 50px;
  padding-right: 50px;
  font-size: 1.8rem;
  margin-bottom: 20px;
}
</style>

<script>

export default {
  name: "SearchResults",
  props: {
    results: {
      type: Array,
      required: true
    }
},
computed: {
  resultsExist() {
    return this.results != null && this.results.length > 0
  }
},
  data() {
    return {
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
          name: "SearchType",
          required: true,
          label: "Search Type",
          align: "left",
          field: (row) => row.searchResultType,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "searchResultSubtype",
          required: true,
          label: "SubType",
          align: "left",
          field: (row) => row.searchResultSubtype,
          format: (val) => `${val}`,
          sortable: true,
        },
      ],
      initialPagination: {
        descending: false,
        page: 1,
        rowsPerPage: 50
        // rowsNumber: xx if getting data from a server
      },
    }
  }
}
</script>
