const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const metadata = require("gcp-metadata");

const {
  DataplexServiceClient,
  MetadataServiceClient,
} = require("@google-cloud/dataplex");
const { DataCatalogClient } = require("@google-cloud/datacatalog").v1;

require("dotenv/config"); // configure reading from .env
const { OAuth2Client } = require("google-auth-library");
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

const nameItems = ['entry.dataset','entry.table','entry.routine.procedure','entry.table.view','entry.model']

// Project ID and location from external file for now
projectId = process.env.PROJECT_ID
location = process.env.LOCATION

const ProjectURL = `projects/${projectId}/locations/${location}`

async function listLakes() {
  const [lakes] = await dataplex_client.listLakes({
    parent: ProjectURL,
  });
  console.info(lakes);
  return lakes;
}

//https://cloud.google.com/data-catalog/docs/how-to/search#node.js
async function search(q) {

  query = q;

  // Create request.
  const scope = {
    includeProjectIds: [projectId],
    // Alternatively, search using Google Cloud Organization scopes.
    // includeOrgIds: [organizationId],
  };

  const req = {
    scope: scope,
    query: query,
  };

  things = [];

  try {

    const [results] = await datacatalog_client.searchCatalog(req);

    filteredOutCount = 0

    results.forEach((result) => {

      if ( nameItems.includes(result.searchResultSubtype) && result.searchResultSubtype != '') {
        if (result.displayName == '') {
          result.displayName = result.linkedResource.substring(result.linkedResource.lastIndexOf('/') + 1)
        }
      }

      things.push(result);

    });

  } catch (exception) {
    console.log("Exception: " + exception);
  }
  return things;
}

app.get("/getLakes", async (req, res) => {
  lakes = [];
  try {
    lakes = await listLakes();
    res.status(200).send(`${lakes}`).end();
  } catch (error) {
    console.log(error);
  }
  console.log("Search results: " + JSON.stringify(lakes));
});

// Get details of an individual lake
app.get("/getLake", async (req, res) => {
  lakes = [];
  try {
    lakes = await listLakes();
    res.status(200).send(`${lakes}`).end();
  } catch (error) {
    console.log(error);
  }
  console.log("Search results: " + JSON.stringify(lakes));
});

async function getAllTags() {

  // Create request.
  //const scope = {
 //   includeProjectIds: [projectId],
    // Alternatively, search using Google Cloud Organization scopes.
    // includeOrgIds: [organizationId],
 // };

  const req = {
    parent: "projects/dh-dwh-28039/locations/us-central1/entryGroups/@dataplex_0911de50a422ac50d4ffcf8c216a23e0/entries/272d13afa3eefb5f5bc89b618a2cba27"
  };

  //const [tags] = await datacatalog_client.listTags(req);
  entities = await search(q);

  console.info(tags);
  return tags;
}

// Get tags
app.get("/getTags", async (req, res) => {
  lakes = [];
  try {
    tags = await getTags();
    res.status(200).send(`${tags}`).end();
  } catch (error) {
    console.log(error);
  }
  console.log("Search results: " + JSON.stringify(lakes));
});

app.get("/search", async (req, res) => {
  q = req.query.query;
  console.log("Searching for " + q);
  searchResult = "";
  try {
    console.log("Searching " + ProjectURL + " with query: " + q);
    startTime = Date.now();
    searchResult = await search(q);
    endTime = Date.now();
    console.debug(searchResult)
    console.log( searchResult.length + " search results in " + (endTime - startTime) + " ms")
  } catch (error) {
    console.log(error);
  }
  res.status(200).send(searchResult).end();
});

// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});
