## Description

A sample Rest API app using [Nest](https://github.com/nestjs/nest) framework.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


## Project setup

### Prerequisites

- *MySQL*: Prepare MySQL database for the app.
- create `.env` file, following `.env.example`.

### Install dependencies
```bash
$ npm install
```

### Database migration and seeding

To run the app, you need to migrate your database to ensure schema is matched with the application.

```bash
# run migration
$ npm run migration:run

# revert migration
$ npm run migration:revert
```

To generate a new migration file
```bash
$ npm run migration:generate {migration-name}
```

In addition to the database migration, you also need to run seeder in order to create the first user in the system to be able to call the APIs.

```bash
$ npm run seed
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov

# e2e tests
$ npm run test:e2e
```
