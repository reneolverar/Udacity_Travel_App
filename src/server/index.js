var path = require('path')

// Use express
const express = require('express')
const app = express()
app.use(express.static('dist'))

// Use Cors for cross origin allowance (enable ALL CORS requests)
const cors = require('cors');
app.use(cors());

app.get('/', function (req, res) {
    res.sendFile('/dist/index.html')
})

// Send image template file
app.use('/images', express.static('src/client/media/images'))

// Host weatherbit icons
app.use('/weatherbit_icons', express.static('src/client/media/weatherbit_icons'))

// Host and send cities file
app.use('/cities', express.static('src/client/media/cities500'))
app.get('/citiesFile', function (req, res) {
    res.sendFile('src/client/media/cities500/cities500_reduced_city&country.csv')
})
// Dist folder for main.css for printing module
app.use('/dist', express.static('dist'))

// Use environment variables for API_Key:
const dotenv = require('dotenv')
dotenv.config()
app.get('/apiKey', function (req, res) {
    res.send(
        {
            "GEONAMES_USER_NAME": process.env.GEONAMES_USER_NAME,
            "WEATHERBIT_APIKEY": process.env.WEATHERBIT_APIKEY,
            "PIXABAY_APIKEY": process.env.PIXABAY_APIKEY
        }
         )
})

module.exports = app;