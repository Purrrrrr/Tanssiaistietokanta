# Tanssitietokanta

> Tanssitietokanta

## About

This project uses [Feathers](http://feathersjs.com). An open source framework for building APIs and real-time applications.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/tanssitietokanta
    npm install
    ```

   You also need to install [pandoc](https://pandoc.org/installing.html). At least version 1.17 is recommended.

3. Start your app

    ```
    npm run compile # Compile TypeScript source
    npm run migrate # Run migrations to set up the database
    npm start
    ```

## Testing

Run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

This app comes with a powerful command line interface for Feathers. Here are a few things it can do:

```
$ npx feathers help                           # Show all commands
$ npx feathers generate service               # Generate a new Service
```

## Migrating databases

The app runs its NeDB migrations automatically upon startup.

To create a migration run `npm run create-migration migration-name`

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## License

Copyright (c) 2018
Copyright Purr Consuegra (c) 2018-2022

