# Udacity Front-End Nanodegree Project - Evaluate news article with NLP

This project evaluates text using the MeaningCloud API, which evaluates aspects like polarity, irony and subjectivity.

You can choose to input raw text or an URL to a news article / blog.

A live demonstration of the project can be testet at: https://strong-khapse-48d3b8.netlify.app/

## Getting Started

Follow one of the two following methods to get this project:

### Cloning the project from GIT
Clone this repo using GIT:

```
> git clone https://github.com/reneolverar/Udacity_Sentiment_Analysis_Article_NLP.git

```

### Download the .zip file
Click [here](https://github.com/reneolverar/Udacity_Sentiment_Analysis_Article_NLP/archive/refs/heads/main.zip) to download the .zip file.

## Instructions to run the project

The project can be run in both development and production modes.

### Module set-up

Running this project requires Node installed in your system.

Once Node is installed, navigate to the folder where this project is located in your system, and then install the required packages by running the following command:

```
> npm i --legacy-peer-deps

```

#### Dependecies:

"dependencies": {
    "dotenv": "^16.0.1",
    "express": "^4.18.1",
    "node-fetch": "^3.2.6",
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

### Meaning cloud API Keys

Register to MeaningCloud to get your personal API KEY.

Create a file in the main directory called ".env" with the following code

```
> API_KEY = <YOUR API KEY>

```

### Using the project

##### To build files in dev mode
```
> npm run build-dev

```

##### To build files in production mode
```
> npm run build-prod

```

##### To run all the unit tests
```
> npm test

```

#### To spin up Express server(listens to port: 8081)
```
> npm start

```