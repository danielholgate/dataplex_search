# Dataplex Search (dataplex-search)

A small test application built using the Google Cloud Dataplex / Datacatalog APIs
- uses express.js as a backend server and Vue framework + Quasar for the front end

## Requirements
* Node.js (http://https://nodejs.org)
* npm
* Google Cloud SDK (https://cloud.google.com/sdk/docs/install)

# Getting Started
## 1. Install dependencies

```bash
npm install
```

## 2. Configure Google Cloud authentication
```bash
gcloud auth application-default login
```

Authenticate your user via the browser. User needs to have access to one or more Google Cloud projects where Dataplex and Datacatalog have been set up

## 3. Start the application
In dev mode (for hot-code reloading, error reporting, etc.) with either:

```bash
npm start
```

or start front end and back end in different console windows (for better seperation of logging etc)
```bash
npm run start-quasar
```

```bash
npm run start-server
```

Application will start on http://localhost:8080 (browser should open automatically after application startup)
