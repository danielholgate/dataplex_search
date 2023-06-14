import { defineStore } from 'pinia'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    project: "qwerty123",
  }),
  getters: {
    getProject: (state) => state.project,
  },
  actions: {
    setProject(p) {
      this.project = p
    },
    accessProjects() {

    },
  },
})
