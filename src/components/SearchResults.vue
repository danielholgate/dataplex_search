<template>

<div v-show="resultsExist">

  <q-table :data="results" :rows="results" :columns="columns" :pagination="resultsPagination" selection="multiple" v-model:selected="selected" row-key="relativeResourceName">

    <template v-slot:top-right>
        <q-btn
          color="primary"
          icon-right="archive"
          label="Export to CSV"
          no-caps
          @click="exportTable"
        ></q-btn>
    </template>

    <template v-slot:body-cell-icon="props">
      <q-td :props="props">

        <q-icon>
          <img src="~/assets/results/colors_bigquery_color_1x_web_32dp.png">
        </q-icon>

      </q-td>
    </template>

  </q-table>
</div>

</template>

<style scoped>
.q-table {
  padding-left: 50px;
  padding-right: 50px;
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
methods: {
  colName(a) {
    return "abc"
  },
  getIconPath(entityType) {
    var path = "../assets/results/colors_bigquery_color_1x_web_32dp.png"

    //if (entityType != null) {
    // if (entityType == "entry.table") path = "../assets/results/colors_bigquery_color_1x_web_32dp.png"
    //}

    return new URL("assets/results/colors_bigquery_color_1x_web_32dp.png", import.meta.url).href
    //return "/assets/results/colors_bigquery_color_1x_web_32dp.png"
  }
},
/// selection
handleSelection ({ rows, added, evt }) {
        // ignore selection change from header of not from a direct click event
        if (rows.length !== 1 || evt === void 0) {
          return
        }

        const oldSelectedRow = storedSelectedRow
        const [newSelectedRow] = rows
        const { ctrlKey, shiftKey } = evt

        if (shiftKey !== true) {
          storedSelectedRow = newSelectedRow
        }

        // wait for the default selection to be performed
        nextTick(() => {
          if (shiftKey === true) {
            const tableRows = tableRef.value.filteredSortedRows
            let firstIndex = tableRows.indexOf(oldSelectedRow)
            let lastIndex = tableRows.indexOf(newSelectedRow)

            if (firstIndex < 0) {
              firstIndex = 0
            }

            if (firstIndex > lastIndex) {
              [ firstIndex, lastIndex ] = [ lastIndex, firstIndex ]
            }

            const rangeRows = tableRows.slice(firstIndex, lastIndex + 1)
            // we need the original row object so we can match them against the rows in range
            const selectedRows = selected.value.map(toRaw)

            selected.value = added === true
              ? selectedRows.concat(rangeRows.filter(row => selectedRows.includes(row) === false))
              : selectedRows.filter(row => rangeRows.includes(row) === false)
          }
          else if (ctrlKey !== true && added === true) {
            selected.value = [newSelectedRow]
          }
        })
      },
///

  data() {
    return {
      selected: [],
      columns: [
      {
          name: "icon",
          align: "left",
          field: (row) => row.searchResultSubtype,
          format: (val) => `${val}`,
          style: {
            fontSize: '1.8em'
          }
        },
              {
          name: "searchResultSubtype",
          required: true,
          label: "Type",
          align: "left",
          field: (row) => row.searchResultSubtype,
          format: (val) => `${val}`,
          sortable: true,
          style: {
            fontSize: '1.5em'
          }
        },
        {
          name: "Name",
          required: true,
          label: "Name",
          align: "left",
          field: (row) => row.displayName,
          format: (val) => `${val}`,
          sortable: true,
          style: {
            fontSize: '1.5em'
          }
        },
        {
          name: "description",
          required: true,
          label: "Description",
          align: "left",
          field: (row) => row.description,
          format: (val) => `${val}`,
          sortable: true,
          style: {
            fontSize: '1.5em'
          }
        }
      ],
      resultsPagination: {
        descending: false,
        page: 1,
        rowsPerPage: 100
        // rowsNumber: xx if getting data from a server
      },
    }
  }
}
</script>
