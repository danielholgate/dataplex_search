const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { ProjectsClient } = require("@google-cloud/resource-manager");

const {
  DataplexServiceClient,
  MetadataServiceClient,
} = require("@google-cloud/dataplex");
const { DataCatalogClient } = require("@google-cloud/datacatalog").v1;

require("dotenv/config"); // configure reading from .env
//const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const app = express(),
  port = 3070;

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dataplex_client = new DataplexServiceClient();
const datacatalog_client = new DataCatalogClient();
const metadata_client = new MetadataServiceClient();

const nameItems = [
  "entry.dataset",
  "entry.table",
  "entry.routine.procedure",
  "entry.table.view",
  "entry.model",
];

projectId = process.env.PROJECT_ID;
location = process.env.LOCATION;
organization = process.env.ORGANIZATION_ID;

// Project ID and location from external file for now
var projects = []

if ( process.env.PROJECT_ID.split(",") !== null && process.env.PROJECT_ID.split(",").length > 0) {
  plist = process.env.PROJECT_ID.split(",")
  for (p in plist) {
    projects.push(plist[p])
  }
  } else {
    projects.push(process.env.PROJECT_ID)
  }

function getMainProject() {
  return projects[0];
}

function getAllProjects() {
  return projects;
}

console.log("Projects are: " + JSON.stringify(projects))
const ProjectURL = `projects/${getMainProject()}/locations/${location}`;

async function listLakes() {
  const [lakes] = await dataplex_client.listLakes({
    parent: ProjectURL,
  });
  lakes.forEach((lake) => {
    console.log(lake);
  });
  return lakes;
}

async function listProjects(idOnly) {

  const client = new ProjectsClient();

  [projects] = await client.searchProjects();
  active_projects = [];

  projects.forEach((project) => {
      console.log(project)
      if (project.state == "ACTIVE") {
        active_projects.push({'projectId' : project.projectId, 'displayName' : project.displayName});
        console.info(project);
      }
  })

  console.log("Total " + projects.length + " projects. "  + active_projects.length + " active")
  return active_projects;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/*
 */
function buildUITypeName(searchResultSubtype, displayName) {
  uiDisplay = searchResultSubtype;

  if (
    searchResultSubtype.startsWith("entry.") &&
    !["table", "view", "dataset"].includes(
      searchResultSubtype.substring(searchResultSubtype.lastIndexOf(".") + 1)
    )
  ) {
    uiDisplay =
      "[" +
      searchResultSubtype.substring(searchResultSubtype.lastIndexOf(".") + 1) +
      "]";
  } else {
    uiDisplay = capitalizeFirstLetter(
      searchResultSubtype
        .substring(searchResultSubtype.lastIndexOf(".") + 1)
        .toLowerCase()
    );
  }

  return uiDisplay;
}

function getUIResourceName(linkedResource) {
  return linkedResource.substring(linkedResource.lastIndexOf("/") + 1);
}

// Process the information in the dataplex metadataschema
function processSchema(schema) {
  columns = []

  if (schema.columns !== null ) {
    console.log("Processing schema information..")
    for (x in schema.columns) {
      columns.push(schema.columns[x].column)
    }
    console.log(".." + columns.length + " columns")
    return "Columns:\n" + columns.toString("\n")
  }
  return []
}

function processTags(tags) {

 returnTags = []

 //console.log("\nBeginning to processing Tags:\n" + JSON.stringify(tags))

 if ( tags[0][0] && tags[0][0].fields !== undefined && tags[0][0].fields !== null) {

 tagFields = tags[0][0].fields

  const fields = Object.keys(tagFields);
  fields.forEach((key, index) => {
    returnTags.push({ name : key, value : tagFields[key].enumValue.displayName})
});
  return returnTags
} else {
  return []
}
 }

async function addMetadata(results, callAPI) {
 enriched = []

  for ( r in results ) {

    results[r].metadata = []
    results[r].tagsDisplay = []

    if ( callAPI ) {

    lr = results[r].linkedResource
    var request = { linkedResource : lr };

    if ( results[r].searchResultType !== 'TAG_TEMPLATE') {
      // Add metadata and tags
      try {
      results[r].metadata = await datacatalog_client.lookupEntry(request);

      // Parse out some key metadata details for the UI.  Schema, Personal Data,
      if ( results[r].metadata[0].schema !== null ) {
       // console.log( "Schema is: " + processSchema( results[r].metadata[0].schema ))
        results[r].metadata[0].metadataDescription = processSchema( results[r].metadata[0].schema )
      }

      } catch (exception) {
        console.log("Exception getting metadata",exception)
      }

      if ( ["entry.routine.procedure","entry.table"].includes(results[r].searchResultSubtype) ) {

      try {
          results[r].tags = await datacatalog_client.listTags({ parent : results[r].relativeResourceName})
          results[r].tagsDisplay = processTags(results[r].tags)
        } catch (exception) {
          console.log("Exception getting tags",exception)
        }

    }

    }

  }

    enriched.push(results[r])

  }

  return enriched;
};


//https://cloud.google.com/data-catalog/docs/how-to/search#node.js
async function search(q, proj, enrichForUI) {

  projectArray = []

  if (proj.indexOf(",") > -1) {
    projectArray = proj.split(",")
  } else {
    projectArray = [proj]
  }

  const scope = {
    includeProjectIds: projectArray
  };

  req = {
    scope: scope,
    query: q
  }

  console.log("Search scope: ", JSON.stringify(req) )

  //const iterable = await datacatalog_client.searchCatalogAsync(req);
  //for await (const response of iterable) {
  //    console.log(response);
  //}

  var [results] = await datacatalog_client.searchCatalog(req);

      if ( enrichForUI ) {

        results.forEach( ( result ) => {

          result.projectID = result.relativeResourceName.split("/")[1] //projects/danielholgate-477-202304170918

          result.icon = result.searchResultSubtype.replace(/\./g,"_")
          result.UITypeName = buildUITypeName(
            result.searchResultSubtype,
            result.displayName
          );
          if (result.displayName === null || result.displayName.length == 0)
            result.displayName = getUIResourceName(result.linkedResource);
          })
    }

  return results;
}

app.get("/listLakes", async (req, res) => {
  lakes = [];
  try {
    lakes = await listLakes();
    res.status(200).send(`${lakes}`).end();
  } catch (error) {
    console.log(error);
  }
});

app.get("/listTagTemplates", async (req, res) => {
  tt = [];
  try {
    tt = await listTagTemplates();
    res.status(200).send(`${tt}`).end();
  } catch (error) {
    console.log(error);
  }
});


app.get("/listTerms", async (req, res) => {
  terms = [];
  try {
    terms = await listTerms();
    res.status(200).send(`${terms}`).end();
  } catch (error) {
    console.log(error);
  }
});


app.get("/listProjects", async (req, res) => {
  try {
    projects = await listProjects();
    res.status(200).send(`${JSON.stringify(projects)}`).end();
  } catch (error) {
    console.log(error);
  }
});

async function listTags() {

  console.log("\n1. listTags. Searching for tag_templates")
  var [tag_templates] = await search("type=tag_template",false) //,projectId, organization)
  //if ( ! Array.isArray(tag_templates) ) {
    tag_templates = [tag_templates]
  //}

  console.log("\n2. Processing " + tag_templates.length + " tag templates")

  for (var x = 0; x < tag_templates.length; x++) {

      p = tag_templates[x].relativeResourceName
      console.log("\n3. Finding tags for template: " + p)
      template = datacatalog_client.getTagTemplate({ name:  tag_templates[x].relativeResourceName} )

    }
    return tag_templates
}

app.get("/listTags", async (req, res) => {
  tags = [];
  try {
    tags = await listTags();
    res.status(200).send(`${tags}`).end();
  } catch (error) {
    console.log(error);
  }
});

app.get("/search", async (req, res) => {
  q = req.query.query;
  proj = req.query.project;

  getMetadata = (req.query.metadata == "true")

  searchResults = []
  enrichedResults = []
  results = []

  try {

    console.log("Searching with query: '" + q + "' project: ", proj, getMetadata);
    startTime1 = Date.now();
    searchResults = await search(q,proj,true);
    endTime1 = Date.now();

    if ( ! getMetadata ) {
      console.log("Adding Metadata fields ")
    } else {
      console.log("Adding Metadata from API")
    }
    startTime2 = Date.now();
    enrichedResults = await addMetadata(searchResults,getMetadata)
    endTime2 = Date.now();

    console.log(
      searchResults.length +
        " search results for '" + q + "' in " +
        (endTime1 - startTime1) +
        " ms"
    );

   if ( getMetadata ) {

    if ( enrichedResults !== null ) {

    console.log(
      enrichedResults.length +
        " metadata results in " +
        (endTime2 - startTime2) +
        " ms"
    );
    console.log(
      "Total time " + (endTime2 - startTime1) + " ms"
    );
    results = enrichedResults

   } else {
    console.log("SearchResult was empty object")
   }

  } else {
    results = searchResults
  }

  } catch (error) {
    console.log(error);
  }

  console.log("Returning:\n", JSON.stringify(results))

  res.status(200).send(results).end();
});

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});
