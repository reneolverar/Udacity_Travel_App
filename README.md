# Udacity Front-End Nanodegree Project - Travel App

This project generates a trip summary card and PDF containing itinerary information input by the user.

The project is a single-page application built for demonstration purposes. It integrates data from 3 APIs.

This project was completed for the Udacity Front End Web Developer Nanodegree Program.

![Example of a destination](https://github.com/reneolverar/Udacity_Travel_App/blob/main/src/client/media/images/travel_app_example.png)

### Tools used
* HTML
* SCSS
* Javascript
* Node
* Express
* Webpack
* GeoNames API
* WeatherBit API
* PixaBay API
* Jest
* Workbox

### Project criteria
Criteria are listed in this [rubric](https://review.udacity.com/#!/rubrics/3636/view)

Additionally to the mandatory features, the project was improved with the following add-ons:
* Add end date and display length of trip.
* Pull in an image for the country from Pixabay API when the entered location brings up no results (good for obscure localities).
* Allow user to add multiple destinations on the same trip.
* Pull in weather for additional locations.
* Allow the user to add hotel and/or flight data.
* Multiple places to stay? Multiple flights?
* Allow the user to remove the trip.
* Use Local Storage to save the data so that when they close, then revisit the page, their information is still there.
* Instead of just pulling a single day forecast, pull the forecast for multiple days.
* Incorporate icons into forecast.
* Allow user to Print their trip and/or export to PDF.
* Allow the user to add additional trips
* Automatically sort additional trips by countdown.
* Move expired trips to bottom/have their style change so it’s clear it’s expired.

## Contents

- [Getting Started](#getting-started)
- [Instructions to run the project](#instructions-to-run-the_project)
- [API Keys](#api-keys)
- [Using the project](#using-the-project)

## Getting Started
[(Back to top)](#contents)

Follow one of the two following methods to get this project:

### Cloning the project from GIT
Clone this repo using GIT:

```
> git clone https://github.com/reneolverar/Udacity_Travel_App.git

```

### Download the .zip file
Click [here](https://github.com/reneolverar/Udacity_Travel_App/archive/refs/heads/main.zip) to download the .zip file.

## Instructions to run the project
[(Back to top)](#contents)

The project can be run in both development and production modes.

### Module set-up

To run this app, you'll need the following installed globally on your machine:
- [Node.js](https://nodejs.org/en/)
- [NPM](https://nodejs.org/en/)

Once Node and NPM are installed, navigate to the folder where this project is located in your system, and then install the required packages by running the following command:

```
> npm i --legacy-peer-deps

```

#### Dependecies:

All dependencies (build tools & plugins), are listed in [package.json](./package.json).

"dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.1",
    "express": "^4.18.1",
    "moment": "^2.29.3",
    "node-fetch": "^3.2.6",
    "print-js": "^1.6.0",
    "webpack": "^5.73.0",
    "webpack-cli": "^4.9.2"
  },
  "devDependencies": {
    "@babel/core": "^7.18.2",
    "@babel/preset-env": "^7.18.2",
    "babel-loader": "^8.2.5",
    "clean-webpack-plugin": "^4.0.0",
    "cross-fetch": "^3.1.5",
    "css-loader": "^6.7.1",
    "html-webpack-plugin": "^5.5.0",
    "jest": "^28.1.1",
    "jest-environment-jsdom": "^28.1.1",
    "mini-css-extract-plugin": "^2.6.0",
    "node-sass": "^7.0.1",
    "optimize-css-assets-webpack-plugin": "^6.0.1",
    "sass-loader": "^13.0.0",
    "style-loader": "^3.3.1",
    "supertest": "^6.2.3",
    "terser-webpack-plugin": "^5.3.3",
    "webpack-dev-server": "^4.9.2",
    "workbox-webpack-plugin": "^6.5.3"
  }

## API Keys
[(Back to top)](#contents)

Register to GeoNames, WeatherBit, and PixaBay to get your personal API keys.
- [Geonames](http://www.geonames.org/export/geonames-search.html)
- [Weatherbit 16-Day Forecast](https://www.weatherbit.io/api/weather-forecast-16-day)
- [Pixabay](https://pixabay.com/api/docs/)

Create a file in the main directory called ".env" with the following code

```
> GEONAMES_USER_NAME = <YOUR API KEY>
> WEATHERBIT_APIKEY = <YOUR API KEY>
> PIXABAY_APIKEY = <YOUR API KEY>

```

## Using the project
[(Back to top)](#contents)

### To build files in dev mode
```
> npm run build-dev

```

### To build files in production mode
```
> npm run build-prod

```

### To run all the unit tests
```
> npm test

```

### To spin up Express server(listens to port: 8081)
```
> npm start

```

### To view the app (on port 8081)
In a browser window, navigate to [http://localhost:8081](http://localhost:8081).