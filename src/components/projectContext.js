var ProjectContext = {
  retrieveProjects() {
      console.log("retrieveProjects: Calling server side to get projects")

      var availableprojects = []
      return new Promise((resolve, reject) => {
        api
          .get("/listProjects", {
            params: {},
          })
          .then(async (response) => {
            resolve(response.data);
            console.log("Adding projects to dropdown ")
            if (response.data != null && response.data != [] && response.data.length > 0) {

              for (item in response.data) {
                availableprojects.append(item.projectId)
              }
              console.log("Projects now: " + availableprojects);
              }  else {
                availableprojects = []
            }
          })
          .catch((error) => {
            reject(error.response);
          });
      });
    }

}

export default ProjectContext
