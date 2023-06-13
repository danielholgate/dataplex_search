import { defineStore } from 'pinia'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projectlist: [],
  }),
  getters: {
    getProjects: (state) => state.projectlist,
  },
  actions: {
    setProjects(p) {
      this.projectlist = p
    },
    accessProjects() {

    },
  },
})
