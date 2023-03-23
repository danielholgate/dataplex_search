<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          Dataplex Search
        </q-toolbar-title>
        <a href="https://cloud.google.com/data-catalog/docs/how-to/search-reference" target="_dataplexsearch">
          <q-icon name='help' color="white" size="2em"/>
        </a>
      </q-toolbar>
    </q-header>

   <q-page-container>
      <router-view/>
  </q-page-container>
  </q-layout>
</template>

<style scope="local">
a { text-decoration: none; }
</style>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {

  },

  setup () {

    return {

    }
  }
})
</script>
