# Tanssitietokanta

The backend part for tanssitietokanta.

## About

This project uses [Feathers](http://feathersjs.com). An open source framework for building APIs and real-time applications.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/tanssitietokanta/backend
    npm ci
    ```

   You also need to install some other software:
   First you need [pandoc](https://pandoc.org/installing.html) for the dance wiki integration to work. At least version 1.17 is recommended.
   Also a running ClamAV daemon is strongly recommended if using file uploads.

3. Start your app in development mode

    ```
    npm run compile # Compile TypeScript source
    npm start
    ```

## Running In Production Mode

You can run the app in production mode by running:

```
npm run compile # Compile TypeScript source
npm start
```

There is also the npm script `start-dev` that runs the production app, but allows for connections without CORS restrictions.

There is also a docker file for running the app in a container with `docker compose up`

## Testing

Run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

This app comes with a powerful command line interface for Feathers. Here are a few things it can do:

```
$ npx feathers help                           # Show all commands
$ npx feathers generate service               # Generate a new Service
```

You probably need to adjust the generated services a lot to match the actual style of the current app.

## Database data

The app stores it's database under the data folder in the line json format used by [NeDB](https://github.com/seald/nedb)
You can pre-populate it with a data dump from this projects [release page](https://github.com/Purrrrrr/Tanssiaistietokanta/releases).

## Migrating databases

The app runs its NeDB migrations automatically upon startup.

To create a migration run `npm run create-migration migration-name`

## GraphQL types

This app uses hosts a GraphQL endpoint which gathers its schema and resolvers
from under the services folders.

For example the GraphQL schema and resolvers for the dances service can be
found in the files `dances.schema.graphql` and `dances.resolvers.ts` that
reside in the folder `src/services/dances`

The app frontend uses the schema for its TypeScript types.

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## License

Copyright (c) 2025
Copyright Purr Consuegra (c) 2018-2025

