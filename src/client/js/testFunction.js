let tripID = 0, destID = 0, hotelID = 0, flightID = 0, destinationLoad = false
let destinations = [""]

export async function testFunction(event = "", destination = "") {

    if (destination == "") {
        event.preventDefault()
        console.log("::: Form Submitted :::")
        destID += 1
        let dest = new Destination(destID);
        destinations[destID] = dest
        localStorage.setItem('destinations', JSON.stringify(destinations))
    } else {
        console.log("::: Building page from local storage :::")
        destID = destination.destID
        let dest = new Destination(destID, destination.hotels, destination.hotelID, destination.flights, destination.flightID);
        destinations[destID] = dest
    }

    // Get days until trip
    let moment = require('moment')
    let startDate = moment(document.getElementById('trip-start').value, 'YYYY-MM-DD')
    let endDate = moment(document.getElementById('trip-end').value, 'YYYY-MM-DD')
    let daysToTrip = startDate.diff(moment().format('YYYY-MM-DD'),'days')
    let tripDuration = endDate.diff(startDate,'days')


    Client.getApiKeys()
    .then(function(res){
        let geonames_apikey = res.GEONAMES_USER_NAME
        let pixabay_apikey = res.PIXABAY_APIKEY
        let weatherbit_apikey = res.WEATHERBIT_APIKEY

        let city = document.getElementById('city').value
        Client.getGeonames(geonames_apikey, city)
        .then(function(res){
            let long = res.geonames[0].lng
            let lat = res.geonames[0].lat
            let countryName = res.geonames[0].countryName
            Client.getPixabay(pixabay_apikey, city, countryName)
            .then(function(res){
                let webURL = "", imageURL ="", tags =""
                // Fill trip information
                // Pull in an image for the country from Pixabay API when the entered location brings up no results (good for obscure localities)
                for (let index = 0; index < res.hits.length; index++) {
                    if (res.hits[index].tags.search(city.toLowerCase()) > 0) {
                        webURL = res.hits[index].webformatURL
                        imageURL = res.hits[index].pageURL
                        tags = res.hits[index].tags
                        document.getElementById("destination-image-description" + destID).innerHTML = "Pixabay.com image of " + city + ", " + countryName;
                        document.getElementById("destination-image" + destID).alt = "Pixabay.com image of " + city + ", " + countryName;
                        document.getElementById("destination-image" + destID).src = webURL;
                        break
                    }
                }
                if (webURL == "") {
                    Client.getPixabay(pixabay_apikey, city, countryName, "country")
                    .then(function(res){
                        for (let index = 0; index < res.hits.length; index++) {
                            if (res.hits[index].tags.search(countryName.toLowerCase()) > 0) {
                                webURL = res.hits[index].webformatURL
                                imageURL = res.hits[index].pageURL
                                tags = res.hits[index].tags
                                document.getElementById("destination-image-description" + destID).innerHTML = "Pixabay.com image of " + countryName;
                                document.getElementById("destination-image" + destID).alt = "Pixabay.com image of " + countryName;
                                document.getElementById("destination-image" + destID).src = webURL;
                                break
                            }
                        }
                    })
                }
                if (webURL == "") {
                    document.getElementById("destination-image-description" + destID).innerHTML = "City or country not found";
                }
                document.getElementById("destination-info" + destID).innerHTML = `
                    <strong>My trip to: ${city}, ${countryName}<br>
                    Departing: ${startDate.format('DD-MM-YYYY')}<br>
                    Returning: ${endDate.format('DD-MM-YYYY')}<br>
                    Total days: ${tripDuration}</strong><br><br>
                    ${city}, ${countryName} is ${daysToTrip} days away.`
                })

                if (daysToTrip < 15) {
                    Client.getWeatherbit(weatherbit_apikey, lat, long)
                    .then(function(res){
                        let weatherDate = [], sunrise = [], sunset = [], tempMax = [], tempMin = [], apparentTempMax = [], apparentTempMin = [], relativeHumidity = [], cloudCoverage = [], weatherIcon = [], weatherDescription = [], rainProb = []
                        sunrise[0] = new Date(res.data[0].sunrise_ts).toLocaleTimeString("en-US")
                        sunset[0] =  new Date(res.data[0].sunset_ts).toLocaleTimeString("en-US")
                        document.getElementById("weather-info" + destID).innerHTML = `The typical weather for the chosen date(s) is:<br>
                                Sunrise at ${sunrise[0]}, Sunset at ${sunset[0]}<br>`
                        document.getElementById("weather-details-container" + destID).innerHTML="";
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
                            document.getElementById("weather-details-container" + destID).appendChild(img);
                            let det = document.createElement('p');
                            det.innerHTML = `
                                <strong>${moment(weatherDate[index-daysToTrip]).format('DD-MM-YYYY')}</strong><br>
                                Min ${Math.round(tempMin[index-daysToTrip])}°C Max ${Math.round(tempMax[index-daysToTrip])}°C (Feel ${Math.round(apparentTempMax[index-daysToTrip])}°C)<br>
                                Hum ${relativeHumidity[index-daysToTrip]}% Cloud ${cloudCoverage[index-daysToTrip]}% Rain ${rainProb[index-daysToTrip]}%<br>
                                ${weatherDescription[index-daysToTrip]}`
                            det.setAttribute('class', 'weather-details', 'id', 'weather-details' + (index-daysToTrip));
                            document.getElementById("weather-details-container" + destID).appendChild(det);
                            return destinationLoad = true
                        }
                    })
                } else {
                }
         })
    })
}

class Destination {
    // Properties
    hotels = []; hotelID = 0; flights = []; flightID = 0;
    // Constructor
    constructor(destID, hotels = [], hotelID = 0, flights = [], flightID = 0) {
        console.log("New destination dest" + destID + " created")
        this.destID = destID;
        let div = document.createElement('div');
        div.id = "destNum" + destID;
        div.className = "destination-container"
        this.html = `
            <img id="${"destination-image" + destID}" class="destination-image" src="" alt="">
            <span id="${"destination-image-description" + destID}" class="destination-image-details"></span>
            <span id="${"destination-info" + destID}" class="destination-info"></span>
            <div id="${"destination-options" + destID}" class="destination-options">
                <input id="${"addFlight" + destID}" type="submit" value="Add flight info">
                <input id="${"addHotel" + destID}" type="submit" value="Add hotel info">
                <input type="submit" value="Print trip" onclick="Client.printHTML('mytrips')" onsubmit="Client.printHTML('mytrips')">
                <input id="${"deleteDestination" + destID}" type="submit" value="Delete destination">
            </div>
            <div id="${"destination-details-container" + destID}" class="destination-details-container">
                <div id="${"flight-info" + destID}" class="flight-info"></div>
                <div id="${"hotel-info" + destID}" class="hotel-info"></div>
            </div>
            <div id="${"weather-container" + destID}" class="weather-container">
                <p id="${"weather-info" + destID}" class="weather-info"></p>
                <span id="${"weather-details-container" + destID}"></span>
            </div>`
        div.innerHTML = this.html
        document.getElementById("mytrips").appendChild(div);
        document.getElementById("addHotel" + this.destID).addEventListener("click",function(event){
            destinations[this.destID].addHotel(destinations[this.destID])
        })
        document.getElementById("addFlight" + this.destID).addEventListener("click",function(event){
            destinations[this.destID].addFlight(destinations[this.destID])
        })
        document.getElementById("deleteDestination" + this.destID).addEventListener("click",function(event){
            destinations[this.destID].deleteDestination(event, destinations[this.destID])
        })
    }
    // Methods
    addHotel(dest) {
        dest.hotelID += 1
        dest.hotels[dest.hotelID] = {"HTML": `
            <img id= "hotel-${dest.destID}${dest.hotelID}-delete" class="destination-icon" src="http://localhost:8081/images/delete_icon.png" alt="delete_icon">
            <textarea id="hotel-name-${dest.destID}${dest.hotelID}" type="text" name="hotel-name" placeholder="Hotel details"></textarea>
            <input id="hotel-arrival-${dest.destID}${dest.hotelID}" type="date" name="hotel-arrival">
            <input id="hotel-departure-${dest.destID}${dest.hotelID}" type="date" name="hotel-departure">`};
        let div = document.createElement('div');
        div.className = 'hotel-info-details';
        div.innerHTML = dest.hotels[dest.hotelID].HTML
        document.getElementById("hotel-info" + dest.destID).appendChild(div)
        document.getElementById("hotel-" + dest.destID + dest.hotelID + "-delete").addEventListener("click",function(event){
            destinations[destID].deleteHotel(dest, dest.hotelID, event)
        })
        localStorage.setItem('destinations', JSON.stringify(destinations))
    }

    deleteHotel(dest, hotelID, event) {
        dest.hotels.splice(hotelID, 1)
        event.target.parentElement.remove()
        dest.hotelID -= 1
        localStorage.setItem('destinations', JSON.stringify(destinations))
    }

    addFlight(dest) {
        dest.flightID += 1
        dest.flights[dest.flightID] = {"HTML": `
            <img id= "flight-${dest.destID}${dest.flightID}-delete" class="destination-icon" src="http://localhost:8081/images/delete_icon.png" alt="delete_icon">
            <textarea id="flight-name-${dest.destID}${dest.flightID}" type="text" name="flight-name" placeholder="Flight details"></textarea>`};
        let div = document.createElement('div');
        div.className = 'flight-info-details';
        div.innerHTML = dest.flights[dest.flightID].HTML
        document.getElementById("flight-info" + dest.destID).appendChild(div)
        document.getElementById("flight-" + dest.destID + dest.flightID + "-delete").addEventListener("click",function(event){
            destinations[destID].deleteFlight(dest, dest.flightID, event)
        })
        localStorage.setItem('destinations', JSON.stringify(destinations))
    }

    deleteFlight(dest, flightID, event) {
        dest.flights.splice(flightID, 1)
        event.target.parentElement.remove()
        dest.flightID -= 1
        localStorage.setItem('destinations', JSON.stringify(destinations))
    }

    deleteDestination (event, dest) {
        console.log(event.target.parentElement.parentElement.parentElement.id)
        event.target.parentElement.parentElement.remove()
        destinations.splice(dest.destID, 1)
        localStorage.setItem('destinations', JSON.stringify(destinations))
    }
}

// Initialize values
window.addEventListener('DOMContentLoaded', (event) => {
    let moment = require('moment')
    document.getElementById('trip-start').value = moment().add(3, 'days').format('YYYY-MM-DD')
    document.getElementById('trip-end').value = moment().add(6, 'days').format('YYYY-MM-DD')
});

window.onload = function() {
    const localStorageDestinations = JSON.parse(localStorage.getItem('destinations'))
    console.log(localStorageDestinations)
    for (let index = 1; index < localStorageDestinations.length; index++) {
        testFunction("", localStorageDestinations[index])
        // while (destinationLoad == false) {
        // }
    }
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function redoLocalStorage (destination) {
    const res = await testFunction("", destination);
    try {
        const body = await res;
        console.log(body)
        return body
    } catch (error) {
        // appropriately handle the error
        console.log('error', error);
        return error;
    }
}


// Extra code:
// this.html = `
//             <img id="${"destination-image" + destID}" class="destination-image" src="" alt="">
//             <span id="${"destination-image-description" + destID}" class="destination-image-details"></span>
//             <span id="${"destination-info" + destID}" class="destination-info"></span>
//             <div id="${"destination-options" + destID}" class="destination-options">
//                 <input type="submit" value="Add flight info" onclick="Client.addFlight(event, ${destID})" onsubmit="Client.addFlight(event, ${destID})">
//                 <input type="submit" value="Add hotel info" onclick="Client.addHotel(${self}, event, ${destID})" onsubmit="Client.addHotel(${this}, event, ${destID})">
//                 <input type="submit" value="Print trip" onclick="Client.printHTML('mytrips')" onsubmit="Client.printHTML('mytrips')">
//                 <input type="submit" value="Delete destination" onclick="Client.deleteDestination(event)" onsubmit="Client.deleteDestination(event)">
//             </div>
//             <div id="${"destination-details-container" + destID}" class="destination-details-container">
//                 <div id="${"flight-info" + destID}"></div>
//                 <div id="${"hotel-info" + destID}"></div>
//             </div>
//             <div id="${"weather-container" + destID}" class="weather-container">
//                 <p id="${"weather-info" + destID}" class="weather-info"></p>
//                 <span id="${"weather-details-container" + destID}"></span>
//             </div>`