<template>

<div>
  {{result}}
</div>

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
  name: "SearchResult",
  props: {
    result: {
      type: Array,
      required: true
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
      ]
    }
  }
}
</script>
