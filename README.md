# scoops-server
The Node.js-powered content API of UBC SCOOPS (Science Co-op Students Association). Built using Restify for the main HTTP endpoints, Cassandra for data persistence, and Redis for fast storage aof token associations.

## Summary of Features
The server provides public endpoints for user registration, and reading articles and events data. This is used for the public-facing web client. Writes (POSTs and PATCHs) require a bearer token that can be requested at the /token endpoint with client key/secret and user email/password. Forms and responses resources will be included in the future.

## Running the Server
1. **Dependencies** - Install node.js and run **npm install**
2. **Set up Cassandra** - A Cassandra entry point, either local or remote is required for persistence. The Cassandra host, port, credentials, and keyspace must be specified in **config.json**.
3. **Create the Cassandra Tables** - In the root project folder, run **npm run createtables** to initialize the necessary UDTs and tables in the configured database and keyspace.
4. **Set up Redis** - A Redis instance, preferably local for fast read speeds, is required for the storage of authentication tokens. The host and port must be configured in **config.json**.
5. **Start the Server** - Run **npm start**.


