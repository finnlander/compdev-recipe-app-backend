# RecipeApp (backend)

This is a simple backend created for the [`recipe-app-frontend`](https://github.com/finnlander/compdev-recipe-app-frontend) repository to work as a backend server that has a very
simple (json-server and lowdb based) data storage (i.e. json file as a db) and some API endpoints for providing the data and storage for the frontend application. The API authentication is using Json Web Tokens ([JWTs](https://jwt.io/)).

## About

This backend was created for a learning goal to familiarize myself with the Angular framework and its' latest practices and was just a mean to provide the required functionality for the frontend app that was the main goal for competence development.

The solution is not meant to be used in any production system. I've put it into github just for myself and others to see as an example backend for the [`recipe-app-frontend`](https://github.com/finnlander/compdev-recipe-app-frontend) solution of an Angular project with some of the basic building blocks needed by many of the common web apps.

## Development

The code is written using Typescript. The server is built by extending capabilities the `json-server` library provides and it uses Node.js and Express framework on top of it. The development server is run with `ts-node-dev` tool that compiles the typescript files, runs the code on Node.js and includes change detection for the files (for improved development experience).

### Prerequisites

- Node.js (used v18.12.1)

### Starting the development server

- Run `npm install` to install the required dependencies.
- Create a file named `secret_key` to the project root with a randomly generated string (key) as a content. It is used to create JWT authentication tokens used by the API communication.
- Run `npm start` (a simple script included in `package.json`) to start the Express application.

### Project structure

Most of the logic (e.g. the custom API endpoints that extends [`json-server`](https://github.com/typicode/json-server) based APIs) is included in the `src/server.ts` file. There are couple of data models under `src/models` (matched with the frontend expectations) and couple of services (in `/src`) that provides some logic around the features.

### Test data

The data is stored into `db.json` file (used by the `lowdb` and `json-server`). There is some prepared test data included that helps the frontend development (which was the main goal for this project).

The initial test data set includes one user (username: `testUser`, password:`testUser`), three food recipes (that are not tested in "production", so the quality is not assured here 😂) and the ingredients included by the recipes.

Feel free to clear the data, but keep the empty arrays as the `json-server` provides APIs based on the content of the data storage file.

## License (MIT)

Copyright 2023 Janne Suomalainen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
