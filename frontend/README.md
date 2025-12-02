# Tanssitietokanta

The frontend part for tanssitietokanta.

## About

This projects uses React as the framework for the app and vite to build it.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/tanssitietokanta/frontend
    npm ci
    ```

    You also need to have the [backend](../backend/) installed and running. See its documentation for more info.

3. Start your app in development mode
    
   ```
   npm start
   ```

   Note that the script fetches GraphQL type information from the backend
   before running vite so you need to have the backend running for it to work at all.

   You can also run this codegen script by calling `npm run codegen`.
   You need to do this every time the GraphQL interfaces change to update the frontend types.

## Building a production build

Run `npm run build` to build a production build for your app. You then need to host the app on a server
that properly rewrites api calls to the backend.

A working configuration for an Apache virtual host would look something like this:

```
<Location />
	RewriteCond %{REQUEST_URI} !^/api/.*
	RewriteCond %{REQUEST_FILENAME} !-f
	RewriteRule ^ index.html [QSA,L]
</Location>

ProxyPass "/api" "http://localhost:8082"
ProxyPassReverse "/api" "http://localhost:8082"
```
