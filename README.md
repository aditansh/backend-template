# Welcome to backend-template 👋
[![Version](https://img.shields.io/npm/v/backend-template.svg)](https://www.npmjs.com/package/backend-template)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](#)

### Backend Created Using 
* NodeJS
* ExpressJS
* Postgres
* JWT 
* Sequelize 

> Users and Posts Table Created Using Sequelize CLI 

## Available Routes for Users 

* /users/signup to create new users
* /users/login to login an existing users 
* /users/token to generate a jwt access token for a user
* /users/logout to logout a user

## Available Routes for Posts 

* /product/ to get all posts by the user
* /product/new to create a new post
* /product/update to update a post 
* /product/delete to delete a post

## Install

```sh
npm install
```

## Usage

```sh
npm server.js
```

## Reset database

```sh
npm run db:reset
```

## Author

👤 **Aaditya Mahanta**

* Github: [@aditansh](https://github.com/aditansh)

## Show your support

Give a ⭐️ if this project helped you!


***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_