export function testFunction(event) {
    event.preventDefault()
    console.log("::: Form Submitted :::")

    getApiKeys()
    .then(function(res){
        let geonames_apikey = res.GEONAMES_USER_NAME
        let pixabay_apikey = res.PIXABAY_APIKEY
        let weatherbit_apikey = res.WEATHERBIT_APIKEY

        // Get days until trip
        let moment = require('moment')
        let startDate = moment(document.getElementById('trip-start').value, 'YYYY-MM-DD')
        let endDate = moment(document.getElementById('trip-end').value, 'YYYY-MM-DD')
        let daysToTrip = startDate.diff(moment().format('YYYY-MM-DD'),'days')
        let tripDuration = endDate.diff(startDate,'days')

        let city = document.getElementById('city').value
        getGeonames(geonames_apikey, city)
        .then(function(res){
            let long = res.geonames[0].lng
            let lat = res.geonames[0].lat
            let countryName = res.geonames[0].countryName
            getPixabay(pixabay_apikey, city, countryName)
            .then(function(res){
                let webURL = "", imageURL ="", tags =""
                // Fill trip information
                // Pull in an image for the country from Pixabay API when the entered location brings up no results (good for obscure localities)
                for (let index = 0; index < res.hits.length; index++) {
                    if (res.hits[index].tags.search(city.toLowerCase()) > 0) {
                        webURL = res.hits[index].webformatURL
                        imageURL = res.hits[index].pageURL
                        tags = res.hits[index].tags
                        document.getElementById("mytrip-image-description").innerHTML = "Pixabay.com image of " + city + ", " + countryName;
                        document.getElementById("mytrip-image").alt = "Pixabay.com image of " + city + ", " + countryName;
                        document.getElementById("mytrip-image").src = webURL;
                        break
                    }
                }
                if (webURL == "") {
                    getPixabay(pixabay_apikey, city, countryName, "country")
                    .then(function(res){
                        for (let index = 0; index < res.hits.length; index++) {
                            if (res.hits[index].tags.search(countryName.toLowerCase()) > 0) {
                                webURL = res.hits[index].webformatURL
                                imageURL = res.hits[index].pageURL
                                tags = res.hits[index].tags
                                document.getElementById("mytrip-image-description").innerHTML = "Pixabay.com image of " + countryName;
                                document.getElementById("mytrip-image").alt = "Pixabay.com image of " + countryName;
                                document.getElementById("mytrip-image").src = webURL;
                                break
                            }
                        }
                    })
                }
                if (webURL == "") {
                    document.getElementById("mytrip-image-description").innerHTML = "City or country not found";
                }
                document.getElementById("mytrip-info").innerHTML = `
                    <strong>My trip to: ${city}, ${countryName}<br>
                    Departing: ${startDate.format('DD-MM-YYYY')}<br>
                    Returning: ${endDate.format('DD-MM-YYYY')}<br>
                    Total days: ${tripDuration}</strong><br><br>
                    ${city}, ${countryName} is ${daysToTrip} days away.`
                })

                if (daysToTrip < 15) {
                    getWeatherbit(weatherbit_apikey, lat, long)
                    .then(function(res){
                        let weatherDate = [], sunrise = [], sunset = [], tempMax = [], tempMin = [], apparentTempMax = [], apparentTempMin = [], relativeHumidity = [], cloudCoverage = [], weatherIcon = [], weatherDescription = [], rainProb = []
                        sunrise[0] = new Date(res.data[0].sunrise_ts).toLocaleTimeString("en-US")
                        sunset[0] =  new Date(res.data[0].sunset_ts).toLocaleTimeString("en-US")
                        document.getElementById("weather-info").innerHTML = `The typical weather for the chosen date(s) is:<br>
                                Sunrise at ${sunrise[0]}, Sunset at ${sunset[0]}<br>`
                        document.getElementById("weather-details-container").innerHTML="";
                        for (let index = daysToTrip; index < daysToTrip + tripDuration; index++) {
                            if (index > res.data.length ) {
                                break
                            }
                            weatherDate[index-daysToTrip] = res.data[index].valid_date
                            tempMax[index-daysToTrip] = res.data[index].max_temp
                            tempMin[index-daysToTrip] = res.data[index].min_temp
                            apparentTempMax[index-daysToTrip] = res.data[index].app_max_temp
                            apparentTempMin[index-daysToTrip] = res.data[index].app_min_temp
                            relativeHumidity[index-daysToTrip] = res.data[index].rh
                            cloudCoverage[index-daysToTrip] = res.data[index].clouds
                            weatherIcon[index-daysToTrip] = res.data[index].weather.icon
                            weatherDescription[index-daysToTrip] = res.data[index].weather.description
                            rainProb[index-daysToTrip] = res.data[index].pop

                            // Fill weather information
                            let img = document.createElement('img');
                            img.src = "http://localhost:8081/weatherbit_icons/" + weatherIcon[index-daysToTrip] + ".png";
                            img.setAttribute('class', 'weather-image', 'id', 'weather-image' + (index-daysToTrip));
                            document.getElementById("weather-details-container").appendChild(img);
                            let det = document.createElement('p');
                            det.innerHTML = `
                                <strong>${moment(weatherDate[index-daysToTrip]).format('DD-MM-YYYY')}</strong><br>
                                Min ${Math.round(tempMin[index-daysToTrip])}°C Max ${Math.round(tempMax[index-daysToTrip])}°C (Feel ${Math.round(apparentTempMax[index-daysToTrip])}°C)<br>
                                Hum ${relativeHumidity[index-daysToTrip]}% Cloud ${cloudCoverage[index-daysToTrip]}% Rain ${rainProb[index-daysToTrip]}%<br>
                                ${weatherDescription[index-daysToTrip]}`
                            det.setAttribute('class', 'weather-details', 'id', 'weather-details' + (index-daysToTrip));
                            document.getElementById("weather-details-container").appendChild(det);
                        }
                    })
                } else {
                }
        })
    })
}
export async function getApiKeys () {
    // Get API KEYS from server
    console.log("Fetching API key from server");
    const res = await fetch('http://localhost:8081/apiKey')
    try {
        if (res.status != '200') {
            throw Error(res.status);
        }
        const body = await res.json();
        return body
    } catch (error) {
        // appropriately handle the error
        console.log('error', error);
        return error;
    }
}
export async function getGeonames (geonames_apikey, city) {
    // Fetch Geonames data
    console.log("Fetching geonames")
    // document.getElementById('testResults').innerHTML += encodeURIComponent("töt Nex")
    const res = await fetch('http://api.geonames.org/searchJSON?q='+ city + '&maxRows=10&username=' + geonames_apikey)
    try {
        if (res.status != '200') {
            throw Error(res.status);
        }
        const body = await res.json();
        console.log(body)
        return body
    } catch (error) {
        // appropriately handle the error
        console.log('error', error);
        return error;
    }
}
export async function getPixabay (pixabay_apikey, city, countryName, search = "city") {
    // Fetch Pixabay
    console.log("Fetching pixbay")
    let fetchURL
    if (search == "city") {
        fetchURL = 'https://pixabay.com/api/?key=' + pixabay_apikey + '&q=' + city + '%20' + countryName + '&image_type=photo&pretty=true&category=places'
    }
    else {
        fetchURL = 'https://pixabay.com/api/?key=' + pixabay_apikey + '&q=' + countryName + '&image_type=photo&pretty=true&category=places'
    }
    const res = await fetch(fetchURL)
    try {
        if (res.status != '200') {
            throw Error(res.status);
        }
        const body = await res.json();
        console.log(body)
        return body
    } catch (error) {
        // appropriately handle the error
        console.log('error', error);
        return error;
    }
}
export async function getWeatherbit (weatherbit_apikey, lat, long) {
    // Fetch weatherbit information
    console.log("Fetching weatherbit")
    const res = await fetch("https://api.weatherbit.io/v2.0/forecast/daily?lat=" + lat + "&lon=" + long + "&key=" + weatherbit_apikey)
    try {
        if (res.status != '200') {
            throw Error(res.status);
        }
        const body = await res.json();
        console.log(body)
        return body
    } catch (error) {
        // appropriately handle the error
        console.log('error', error);
        return error;
    }
}

// Show trip example
window.addEventListener('DOMContentLoaded', (event) => {
    let moment = require('moment')
    document.getElementById("mytrip-image").src = 'http://localhost:8081/images/city_img_template.jpg'
    document.getElementById('trip-start').value = moment().add(3, 'days').format('YYYY-MM-DD')
    document.getElementById('trip-end').value = moment().add(6, 'days').format('YYYY-MM-DD')
    document.getElementById("mytrip-image").alt = "Pixabay.com image of London, United Kingdom"
    document.getElementById("mytrip-info").innerHTML = `
        <strong>My trip to:  London, United Kingdom<br>
        Departing: ${moment(document.getElementById('trip-start').value).format('DD-MM-YYYY')}<br>
        Returning: ${moment(document.getElementById('trip-end').value).format('DD-MM-YYYY')}<br>
        Total days: 3</strong><br><br>
        London, United Kingdom is 3 days away.`
});


export function todaysDate(){
    // return new Date().format('d-m-Y')
    let today = new Date().toLocaleDateString()
    console.log(today)
    return today
}

export function isValidURL(string) {
    const res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    const space = string.match(/ /gm);
    return (res !== null && space == null)
}

function checkTextType(){
    const radioButtons = document.querySelectorAll('input[name="text_type"]');
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            return radioButton.value;
        }
    }
}