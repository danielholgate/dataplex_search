<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-toolbar-title>
          Dataplex Search
        </q-toolbar-title>

          <div style="display:none">
            <q-select v-model="model" :options="projects" behavior="menu" label="Projects"></q-select>
          </div>
          <a href="https://cloud.google.com/data-catalog/docs/how-to/search-reference" target="_dataplexsearch">
          <q-icon name='help' color="white" size="2em"/>
        </a>
        <q-btn-dropdown stretch flat :label="projectID" style="min-width:200px">
        <q-list>
          <q-item v-for="(item, index) in theProjects" :key="index" v-close-popup tabindex="0" clickable v-ripple>
            <q-item-section avatar @click="setProject(item.projectId)">
              <q-avatar icon="folder" color="secondary" text-color="white"></q-avatar>
               <q-item-label>{{item.displayName}}</q-item-label>
               <q-item-label>{{item.projectId}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        </q-btn-dropdown>
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
import { createPinia } from 'pinia'
import { useProjectStore } from 'stores/projects';
import { api } from "src/boot/axios";

const projectstore = useProjectStore()

export default defineComponent({

  name: 'MainLayout',

  components: { },
  mixins: [ ],

  methods: {

    setProject(p) {
      console.log("New project search context set: "  + p)
      this.projectID = p
      projectstore.setProject(p)
    },

    retrieveProjects() {

      self = this

      return new Promise((resolve, reject) => {
        api
          .get("/listProjects", {
            params: {},
          })
          .then(async (response) => {
            resolve(response.data);

            if (response.data != null && response.data != [] && response.data.length > 0) {

              var availableprojects = []

              for (let i = 0; i < response.data.length; i++) {
                availableprojects.push(response.data[i])
              }

              }  else {
                availableprojects = []
            }
            self.theProjects = availableprojects
          })
          .catch((error) => {
            console.log("Error occured while retrieving projects : " + error)
            reject(error.response);
          });
      });
    }

  },

  computed: {
    projects() {
      return (this.theProjects.length == 0 ? this.retrieveProjects() : this.theProjects)
    }
  },

  data: function() {
    return {
      theProjects: [],
      projectID: "Projects"
    }
  },

  setup () {

    return {

    }
  }
})
</script>
