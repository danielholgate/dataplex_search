<template>
  <div v-show="resultsExist">

    <q-table
      :rows="results"
      :columns="columns"
      v-model:pagination="resultsPagination"
      :loading="loading"
      selection="multiple"
      v-model:selected="selected"
      flat
    >

      <template v-slot:top-right>
        <q-btn
          color="primary"
          icon-right="archive"
          label="Export to CSV"
          no-caps
          @click="exportResults"
        ></q-btn>
      </template>

    <template #body-cell-tags="props">
    <q-td :props="props">
        <q-list dense>
           <q-item clickable v-ripple v-for="tag in props.row.tagsDisplay" :key="tag.name">
           <q-item-section>
              <q-badge color="green" :style="{'font-size':'1.2em'}" class="q-ma-sm">{{tag.name}}={{tag.value}}</q-badge>
            </q-item-section>
            </q-item>
        </q-list>
    </q-td>
  </template>

     <template #body-cell-project="props">
    <q-td :props="props">
            <q-badge color="green" :style="{'font-size':'1.2em'}" class="q-ma-sm">{{props.value}}</q-badge>
    </q-td>
  </template>

      <template #body-cell-icon="props">
        <q-td :props="props">
             <div class="justify-center" text-align="center">
             <div text-align="center">
                <img :class="[props.value]">
              </div>
             </div>
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

img {
  width: 1.5em
}

img.entry_dataset {
  content:url("/resultstable/entry_dataset.png");
}

img.entry_table {
  content:url("/resultstable/bq.png");
}

img.tag_template {
  content:url("/resultstable/bq.png");
}

img.entry_zone {
  content:url("/resultstable/bq.png");
}

img.entry_lake {
  content:url("/resultstable/bq.png");
}

img.entry_glossary_term {
  content:url("/resultstable/bq.png");
}

img.entry_routine_procedure {
  content:url("/resultstable/bq.png");
}

</style>

<script>
import { exportFile, copyToClipboard } from "quasar";

export default {
  name: "SearchResults",
  mixins: [],
  props: {
    results: {
      type: Array,
      required: true,
    },
  },
  computed: {
    resultsExist() {
      return this.results != null && this.results.length > 0;
    }
  },
  methods: {
    iconURL(entityType) {
      return entityType + ".png"
    },

    wrapCsvValue(val, formatFn, row) {
      let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

      formatted =
        formatted === void 0 || formatted === null ? "" : String(formatted);

      formatted = formatted.split('"').join('""');
      /**
       * Excel accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines
       */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

      return `"${formatted}"`;
    },

    /// sample code to fetch from server
    /*
function onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      const filter = props.filter

      loading.value = true

      // emulate server
      setTimeout(() => {
        // update rowsCount with appropriate value
        pagination.value.rowsNumber = getRowsNumberCount(filter)

        // get all rows if "All" (0) is selected
        const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage

        // calculate starting row of data
        const startRow = (page - 1) * rowsPerPage

        // fetch data from "server"
        const returnedData = fetchFromServer(startRow, fetchCount, filter, sortBy, descending)

        // clear out existing data and add new
        rows.value.splice(0, rows.value.length, ...returnedData)

        // don't forget to update local pagination object
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        pagination.value.sortBy = sortBy
        pagination.value.descending = descending

        // ...and turn of loading indicator
        loading.value = false
      }, 1500)
    }
*/
    /// end of sample code

    exportResults() {
      const content = [
        this.export_columns.map((col) => this.wrapCsvValue(col.label)),
      ]
        .concat(
          this.results.map((row) =>
            this.export_columns
              .map((col) =>
                this.wrapCsvValue(
                  typeof col.field === "function"
                    ? col.field(row)
                    : row[col.field === void 0 ? col.name : col.field],
                  col.format,
                  row
                )
              )
              .join(",")
          )
        )
        .join("\r\n");

      const status = exportFile(
        "dataplex-search-results.csv",
        content,
        "text/csv"
      );

      if (status !== true) {
        $q.notify({
          message: "Browser denied file download...",
          color: "negative",
          icon: "warning",
        });
      }
    },
    uiName(dataplexName) {
      return "yes";
    },
  },

  /// selection
  handleSelection({ rows, added, evt }) {
    // ignore selection change from header of not from a direct click event
    if (rows.length !== 1 || evt === void 0) {
      return;
    }

    const oldSelectedRow = storedSelectedRow;
    const [newSelectedRow] = rows;
    const { ctrlKey, shiftKey } = evt;

    if (shiftKey !== true) {
      storedSelectedRow = newSelectedRow;
    }

    // wait for the default selection to be performed
    nextTick(() => {
      if (shiftKey === true) {
        const tableRows = tableRef.value.filteredSortedRows;
        let firstIndex = tableRows.indexOf(oldSelectedRow);
        let lastIndex = tableRows.indexOf(newSelectedRow);

        if (firstIndex < 0) {
          firstIndex = 0;
        }

        if (firstIndex > lastIndex) {
          [firstIndex, lastIndex] = [lastIndex, firstIndex];
        }

        const rangeRows = tableRows.slice(firstIndex, lastIndex + 1);
        // we need the original row object so we can match them against the rows in range
        const selectedRows = selected.value.map(toRaw);

        selected.value =
          added === true
            ? selectedRows.concat(
                rangeRows.filter((row) => selectedRows.includes(row) === false)
              )
            : selectedRows.filter((row) => rangeRows.includes(row) === false);
      } else if (ctrlKey !== true && added === true) {
        selected.value = [newSelectedRow];
      }
    });
  },
  ///

  data() {
    return {
      selected: [],
      columns: [
        {
          name: "icon",
          align: "left",
          field: (row) => row.icon,
          format: (val) => `${val}`,
          style: {
            width: "50px",
          },
        },
        {
          name: "type",
          label: "Type",
          align: "left",
          field: (row) => row.UITypeName,
          format: (val) => `${val}`,
          style: {
            width: "50px",
          },
        },
        {
          name: "name",
          required: true,
          label: "Name",
          align: "center",
          field: (row) => row.displayName,
          format: (val) => `${val}`,
          sortable: true,
          style: {
             width: "200px",
          },
        },

        {
          name: "project",
          required: true,
          label: "Project",
          align: "center",
          field: (row) => row.projectID,
          format: (val) => `${val}`,
          sortable: true,
          style: {
             width: "40px",
          },
        },

       {
          name: "tags",
          required: true,
          label: "Tags",
          align: "middle",
          field: (row) => row.tagsDisplay,
          format: (val) => `${val}`,
          sortable: false,
          style: {
            width: "200px",
          },
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
   //         fontSize: "1.5em",
          },
        },
      ],

/*
Columns to export
*/
      export_columns: [
        {
          name: "searchResultSubtype",
          required: true,
          label: "Type",
          align: "left",
          field: (row) => row.searchResultSubtype,
          format: (val) => `${val}`,
          sortable: true,
          style: {
            fontSize: "1.5em",
          },
        },
        {
          name: "Type",
          required: true,
          label: "UI Type",
          align: "left",
          field: (row) => row.UITypeName,
          format: (val) => `${val}`,
          sortable: true,
          style: {
            fontSize: "1.5em",
          },
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
            fontSize: "1.5em",
          },
        },
        {
          name: "URI",
          required: true,
          label: "URI",
          align: "left",
          field: (row) => row.fullyQualifiedName,
          format: (val) => `${val}`,
          sortable: true,
          style: {
            fontSize: "1.5em",
          },
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
            fontSize: "1.5em",
          },
        },
      ],

      resultsPagination: {
        descending: false,
        page: 1,
        rowsPerPage: 30,
        rowsNumber: 10
        // rowsNumber: xx if getting data from a server
      },
    };
  },
};
</script>
