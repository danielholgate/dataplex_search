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

//
async function audience() {
  if (!aud && (await metadata.isAvailable())) {
    let project_number = await metadata.project("numeric-project-id");
    let project_id = await metadata.project("project-id");

    aud = "/projects/" + project_number + "/apps/" + project_id;
  }

  return aud;
}

// Cache externally fetched information for future invocations
let aud;

// Project ID and location from external file for now
projectId = process.env.PROJECT_ID
location = process.env.LOCATION

async function listLakes() {
  const [lakes] = await dataplex_client.listLakes({
    parent: `projects/${projectId}/locations/${location}`,
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
    console.log("Calling search client with query: " + query);

    const [results] = await datacatalog_client.searchCatalog(req);
    console.log(things.length + " results");

    results.forEach((result) => {
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

app.get("/search", async (req, res) => {
  q = req.query.query;
  console.log("Searching for " + q);
  searchResult = "";
  try {
    searchResult = await search(q);
    console.log("Search result: " + searchResult);
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
