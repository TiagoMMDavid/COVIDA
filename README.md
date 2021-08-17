# COVIDA - Chelas Open VIDeogame Application

## Overview
Chelas Open VIDeogame Application (COVIDA) is a web application that allows users to search and browse videogames with the possibility of inserting and managing them into groups.

The groups are made by the user and are restricted to its owner. These can be customized with a name, description and a selection of games. The Web Application provides an authentication functionality for users to create and log into their accounts.

All the data is stored through the use of [Elasticsearch](https://www.elastic.co/elasticsearch/). The information about videogames is gathered through the [IGDB API](https://www.igdb.com/api).

## Table of Contents
- [Functionalities](#functionalities)
- [Preview](#preview)
- [Requirements](#requirements)
  - [Elasticsearch](#elasticsearch)
  - [IGDB API](#igdb-api)
- [Run The Application](#run-the-application)
  - [Install the dependencies](#install-the-dependencies)
  - [Run the tests](#run-the-tests)
  - [Run the Web Application](#run-the-web-application)
- [Credits](#credits)

## Functionalities
COVIDA exposes the following functionalities:
- Functional and responsive Web Application to manage user created videogame groups
- Accessible HTTP API in paths preceded with `/api/covida`
- Authentication feature
  - Possibility to create accounts
  - Sign into your account
  - Delete your account
- List the top videogames
  - Number of results shown can be customizable
  - Possibility to add videogames to groups
- Search for videogames by name
- Manage your groups
  - Create, Edit and Delete
  - Manage videogames (Add/Delete/List)

## Preview
https://user-images.githubusercontent.com/44146594/129779813-1cd7c112-3d64-4d24-8abc-408e6aa54df2.mp4

https://user-images.githubusercontent.com/44146594/129779821-7e202775-4579-4a25-a88b-d8caa8b445a0.mp4

https://user-images.githubusercontent.com/44146594/129779805-9e853a17-c488-4894-b840-f30ca78bb898.mp4

## Requirements
Before running the application, the following steps are necessary:

### Elasticsearch
The application requires to store information about the users and its respective videogame groups. In order to store this data, the NoSQL database [Elasticsearch](https://www.elastic.co/elasticsearch/) was chosen.

Before running the application, do the following steps:
1. Download and unzip Elasticsearch from [here](https://www.elastic.co/downloads/elasticsearch)
2. Run `bin/elasticsearch` (or `bin\elasticsearch.bat` on Windows)

Make sure the Elasticsearch window is always open while running the Web Application

A more detailed guide is available [here](https://www.elastic.co/downloads/elasticsearch).

### IGDB API
Twitch provides a free API which shares data about videogames. This data includes information such as videogames, their rating, number of followers, and much more.

In order to use the [IGDB API](https://www.igdb.com/api) there needs to be a registration of a Twitch Developer Application. With an application, a Client ID and Client Secret is provided. These two are necessary in order to obtain an access token that will be used to perform requests to the API.

COVIDA utilizes environment variables to store the IGDB application Client's ID and its respective access token. In order to obtain these, the following steps are required:
#### Create a Twitch Developer Application
1. Sign Up to **Twitch Developer Console [here](https://dev.twitch.tv/login)**
2. Ensure your twitch account has **Two Factor Authentication [enabled](https://www.twitch.tv/settings/security)**
3. **[Register](https://dev.twitch.tv/console/apps/create)** your application
4. **[Manage](https://dev.twitch.tv/console/apps)** your newly created application
5. Generate a Client Secret by pressing **[New Secret]**
6. Take note of the **Client ID** and **Client Secret**

#### Request an Access Token
To obtain an Access Token make a `POST` request to `https://id.twitch.tv/oauth2/token` with the following query string parameters, substituting your Client ID and Client Secret accordingly.
```
client_id=Your_Client_ID
client_secret=Your_Client_Secret
grant_type=client_credentials
```

A more detailed guide is available [here](https://api-docs.igdb.com/#about).

#### Setup the Environment Variables
After retrieving the application Client's ID and a valid access token, setup the following environment variables:
```
COVIDA_CLIENT_ID=YOUR_CLIENT_ID
COVIDA_AUTHORIZATION=YOUR_ACCESS_TOKEN
```


## Run The Application
After setting up all the requirements, the application can be run. Make sure [Node.js](https://nodejs.org/en/) is installed on your machine!

### Install the dependencies
Firstly, the application dependencies need to be installed.

To do this, execute the following command in the `/app` directory:
```
npm install
```

### Run the tests
To assure the application functions correctly there were developed unit tests and integration tests.

Although not necessary, if you desire to run the tests, execute the following command:
```
npm run test
```

### Run the Web Application
The Web Application provides two optional parameters to run the App:
- The port where the HTTP Server communicates (`8000` if omitted)
- The Elasticsearch index used to store data (`'covida-groups'` if omitted)

There are two ways to change the default port. You can either define the environment variable `COVIDA_PORT` or put it as a first argument while running the application.
The Elasticsearch index used can be changed through the second argument.

To run the web application, execute the following command:
```
npm start [PORT] [ELASTICSEARCH_INDEX]
```

## Credits
This application was implemented in the context of the Internet Programming class at [ISEL](https://www.isel.pt/).

Developed by:
* [TiagoMMDavid](https://github.com/TiagoMMDavid)
* [PTKickass](https://github.com/PTKickass)
* [dvsshadow](https://github.com/dvsshadow)
