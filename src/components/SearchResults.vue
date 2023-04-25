<template>
  <div v-show="resultsExist">

    <q-table
      :data="results"
      :rows="results"
      :columns="columns"
      :pagination="resultsPagination"
      selection="multiple"
      v-model:selected="selected"
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

<!---
      <template v-slot:body-cell-tags="props">
        <q-tr :props="props">
            <q-td key="tagsDisplay" :props="props">
            <v-list density="compact">
                <v-list-item v-for="tag in props.row.tagsDisplay" :key="tag.name">
                  <q-badge color="green" class="q-ma-sm">{{tag.name}}={{tag.value}}</q-badge>
                </v-list-item>

            </v-list>
            </q-td>
          </q-tr>
      </template>
      -->

      <template v-slot:body-cell-icon="props">
        <q-td :props="props">
             <div>
                <img :class="[props.value]">
                <q-tooltip anchor="top middle">{{props.value}}</q-tooltip>
             </div>
             <q-badge :label="props.value"></q-badge>
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
  width: 1.3em
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
      var path = entityType + ".png";

      //if (entityType != null) {
      // if (entityType == "entry.table") path = "../assets/results/colors_bigquery_color_1x_web_32dp.png"
      //}

      return path
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
            fontSize: "1.8em",
            width: "100px",
          },
        },
        {
          name: "name",
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
          name: "tags",
          required: true,
          label: "Tags",
          align: "left",
          field: (row) => row.tagsDisplay,
          format: (val) => `${val}`,
          sortable: false,
          style: {
            fontSize: "1.5em",
          },
        },

        {
          name: "metadata",
          required: true,
          label: "Metadata",
          align: "left",
          field: (row) => row.metadata[0].metadataDescription,
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
        rowsPerPage: 100,
        // rowsNumber: xx if getting data from a server
      },
    };
  },
};
</script>
