let moment = require('moment')
let destID
let destinations = []
let geonames_apikey, pixabay_apikey, weatherbit_apikey
let res
let cityArray

export async function testFunction(event) {
    event.preventDefault()
    console.log("::: Form Submitted :::")

    document.getElementById("loadingMsg").innerHTML = ""

    // Check if end date > start date
    let startDate = moment(document.getElementById('trip-start').value, 'YYYY-MM-DD')
    let endDate = moment(document.getElementById('trip-end').value, 'YYYY-MM-DD')
    if (endDate < startDate) {
        document.getElementById("loadingMsg").innerHTML = "End date is earlier than start date, please correct"
        return
    }

    document.getElementById("loadingMsg").innerHTML = "A new destination is being created, please wait ...."

    let dest
    let tripName = document.getElementById('trip-name').value
    dest = new Destination(tripName, destID);

    // Get user input
    dest.startDate = startDate
    dest.endDate = endDate
    dest.daysToTrip = dest.startDate.diff(moment().format('YYYY-MM-DD'),'days')
    dest.tripDuration = dest.endDate.diff(dest.startDate,'days')
    dest.tripName = document.getElementById('trip-name').value
    let searchCity = document.getElementById('city').value

    // Fetch city information
    res = await Client.getGeonames(geonames_apikey, searchCity)
    dest.city = res.geonames[0].name
    dest.geonames = res
    dest.long = res.geonames[0].lng
    dest.lat = res.geonames[0].lat
    dest.countryName = res.geonames[0].countryName

    // Fetch city pictures
    res = await Client.getPixabay(pixabay_apikey, dest.city, dest.countryName)
    dest.pixabay = res
    dest.cityImgWebURL = ""
    // Pull in an image for the country from Pixabay API when the entered location brings up no results (good for obscure localities)
    for (let index = 0; index < res.hits.length; index++) {
        if (res.hits[index].tags.search(dest.city.toLowerCase()) > 0) {
            dest.cityImgWebURL = res.hits[index].webformatURL
            dest.cityImgDesc = `Pixabay.com image of ${dest.city}, ${dest.countryName}.`
            break
        }
    }
    if (dest.cityImgWebURL == "") {
        res = await Client.getPixabay(pixabay_apikey, dest.city, dest.countryName, "country")
        for (let index = 0; index < res.hits.length; index++) {
            if (res.hits[index].tags.search(dest.countryName.toLowerCase()) > 0) {
                dest.cityImgWebURL = res.hits[index].webformatURL
                dest.cityImgDesc = `Pixabay.com image of ${dest.countryName}.`
                break
            }
        }
        if (dest.cityImgWebURL == "") {
            dest.cityImgDesc = "City or country not found";
        }
    }

    // Fetch weather information
    await fetchWeatherData(dest)

    // Create trip
    await dest.addDestination()
    destinations[dest.destID] = dest
    destID += 1
    document.getElementById("loadingMsg").innerHTML = ""
    console.log(destinations)

    // Check and decide where to insert trip
    checkDestOrder(dest)

    return
    // Style trip if passed
    stylePastTrips()
}

class Destination {

    // Constructor
    constructor(
        // Parameters
        tripName, destID,
        city = "", daysToTrip = "", startDate = "", endDate = "", tripDuration = "",
        hotels = [], hotelID = 0, flights = [], flightID = 0,
        genonames = "", long = "", lat = "", countryName = "",
        pixabay = "", cityImgWebURL = "", cityImgDesc = "",
        weatherbit = "", weatherDate = [], sunrise = [], sunset = [],
        tempMax = [], tempMin = [], apparentTempMax = [], apparentTempMin = [],
        relativeHumidity = [], cloudCoverage = [], weatherIcon = [],
        weatherDescription = [], rainProb = [], html = ""
        ) {
        this.tripName = tripName; this.destID = destID;
        this.city = city; this.daysToTrip = daysToTrip; this.startDate = startDate; this.endDate = endDate; this.tripDuration = tripDuration;
        this.hotels = hotels; this.hotelID = hotelID; this.flights = flights; this.flightID = flightID;
        this.genonames = genonames; this.long = long; this.lat = lat; this.countryName = countryName;
        this.pixabay = pixabay; this.cityImgWebURL = cityImgWebURL; this.cityImgDesc = cityImgDesc;
        this.weatherbit = weatherbit; this.weatherDate = weatherDate; this.sunrise = sunrise; this.sunset = sunset;
        this.tempMax = tempMax; this.tempMin = tempMin; this.apparentTempMax = apparentTempMax; this.apparentTempMin = apparentTempMin;
        this.relativeHumidity = relativeHumidity; this.cloudCoverage = cloudCoverage; this.weatherIcon = weatherIcon;
        this.weatherDescription = weatherDescription; this.rainProb = rainProb;
    }
    // Methods

    async addDestination() {
        // Create destination container
        this.html = `
            <img id="${"destination-image" + this.destID}" class="destination-image" src="" alt="">
            <span id="${"destination-image-description" + this.destID}" class="destination-image-details"></span>
            <span id="${"destination-info" + this.destID}" class="destination-info"></span>
            <div id="${"destination-options" + this.destID}" class="destination-options">
                <input id="${"addFlight" + this.destID}" type="submit" name="addFlight" data-id="${this.destID}" value="Add flight info">
                <input id="${"addHotel" + this.destID}" type="submit" name="addHotel" data-id="${this.destID}" value="Add hotel info">
                <input type="submit" value="Print trip" onclick="Client.printHTML('mytrips')" onsubmit="Client.printHTML('mytrips')">
                <input id="${"deleteDestination" + this.destID}" type="submit" name="deleteDestination" data-id="${this.destID}" value="Delete destination">
            </div>
            <div id="${"destination-details-container" + this.destID}" class="destination-details-container">
                <div id="${"flight-info" + this.destID}" class="flight-info"></div>
                <div id="${"hotel-info" + this.destID}" class="hotel-info"></div>
            </div>
            <div id="${"weather-container" + this.destID}" class="weather-container">
                <p id="${"weather-info" + this.destID}" class="weather-info"></p>
                <span id="${"weather-details-container" + this.destID}" class="weather-day-container"></span>
            </div>`
        let div = document.createElement('div');
        div.id = "destID" + this.destID;
        div.className = "destination-container"
        div.innerHTML = this.html

        // Add destination container to trip container
        if (!document.getElementById(this.tripName)) {
            let div = document.createElement('div');
            div.id = this.tripName;
            div.className = "trip-container"
            document.getElementById("mytrips").appendChild(div);
            document.getElementById(this.tripName).innerHTML = `Trip: ${this.tripName}`
        }
        document.getElementById(this.tripName).appendChild(div);

        // Fill destination container with city picture
        document.getElementById("destination-image-description" + this.destID).innerHTML = this.cityImgDesc
        document.getElementById("destination-image" + this.destID).alt = this.cityImgDesc
        document.getElementById("destination-image" + this.destID).src = this.cityImgWebURL;

        // Add dates and weather info
        await this.updateDatesAndWeather(this)

        // Add event listeners
        document.getElementById("destID" + this.destID).addEventListener("click", checkClickTarget)
        document.getElementById("destID" + this.destID).addEventListener("change", checkChangeTarget)
    }

    async updateDatesAndWeather() {
        // Calculate dates
        this.daysToTrip = moment(this.startDate).diff(moment().format('YYYY-MM-DD'),'days')
        this.tripDuration = moment(this.endDate).diff(this.startDate,'days')
        if (this.tripDuration == 0) { this.tripDuration = 1}

        // Fill destination container with destination city and dates
        document.getElementById("destination-info" + this.destID).innerHTML = `
                    <strong>${this.city}, ${this.countryName}<br>
                    Departing: <input id="trip-start${this.destID}" class="trip-start" type="date" data-id="${this.destID}" name="startDate" value="${moment(this.startDate).format('YYYY-MM-DD')}"><br>
                    Returning: <input id="trip-end${this.destID}" class="trip-end" type="date" data-id="${this.destID}" name="endDate" value="${moment(this.endDate).format('YYYY-MM-DD')}"><br>
                    Total days: ${this.tripDuration}</strong><br><br>
                    ${this.city}, ${this.countryName} is ${this.daysToTrip} days away.`

        // Fill destination container with destination weather information
        let weatherContainer = document.getElementById("weather-container" + this.destID)
        let weatherDetailsContainer = document.getElementById("weather-details-container" + this.destID)
        if (moment(this.endDate).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) {
            document.getElementById("weather-info" + this.destID).innerHTML =
                `This trip is in the past, no weather info available`
            weatherDetailsContainer.innerHTML = ""
        }
        else if (this.daysToTrip < 15) {
            let sunrise, sunset
            for (const element in this.sunrise) {
                if (element != "") {
                    sunrise = new Date(element * 1000).toLocaleTimeString("en-US")
                    sunset = new Date(element * 1000).toLocaleTimeString("en-US")
                    break
                }
            }
            document.getElementById("weather-info" + this.destID).innerHTML =
                `The typical weather for the chosen date(s) is:<br>
                Sunrise at ${sunrise}, Sunset at ${sunset}<br>`
            weatherDetailsContainer.innerHTML="";
            let lastValidDay
            for (let index = this.daysToTrip - 1; index <= this.daysToTrip + this.tripDuration - 1; index++) {
                if (index == this.weatherbit.data.length ) {
                    break
                }
                if (index < 0 ) {
                    continue
                }
                // Fill weather information
                let div = document.createElement('div');
                let src = await "http://localhost:8081/weatherbit_icons/" + this.weatherIcon[index] + ".png";
                div.innerHTML =
                    `<img src=${src} class="weather-image" id="weather-image"${index}>
                    <p class="weather-details" id="weather-details${index}">
                        <strong>${moment(this.weatherDate[index]).format('DD-MM-YYYY')}</strong><br>
                        Min ${Math.round(this.tempMin[index])}°C Max ${Math.round(this.tempMax[index])}°C (Feel ${Math.round(this.apparentTempMax[index])}°C)<br>
                        Hum ${this.relativeHumidity[index]}% Cloud ${this.cloudCoverage[index]}% Rain ${this.rainProb[index]}%<br>
                        ${this.weatherDescription[index]}
                    </p>`
                weatherDetailsContainer.appendChild(div);
            }
        } else {
            document.getElementById("weather-info" + this.destID).innerHTML =
                `Weather information is only available up to 2 weeks before the trip`
        }
    }

    addHotel() {
        this.hotels[this.hotelID] = {"HTML": `
            <img id= "hotel-${this.destID}${this.hotelID}-delete" name="deleteHotel" data-id="${this.destID}" data-hotel-id="${this.hotelID}" class="destination-icon" src="http://localhost:8081/images/delete_icon.png" alt="delete_icon">
            <textarea id="hotel-name${this.destID}${this.hotelID}" type="text" name="hotel-name" date-id="${this.destID}" date-hotel-id="${this.hotelID}" placeholder="Hotel details"></textarea>
            <input id="hotel-arrival${this.destID}${this.hotelID}" type="date" name="hotel-arrival" date-id="${this.destID}" date-hotel-id="${this.hotelID}">
            <input id="hotel-departure${this.destID}${this.hotelID}" type="date" name="hotel-departure" date-id="${this.destID}" date-hotel-id="${this.hotelID}">`};
        let div = document.createElement('div');
        div.id = `hotel-${this.destID}-${this.hotelID}`
        div.className = 'hotel-info-details';
        div.innerHTML = this.hotels[this.hotelID].HTML
        document.getElementById("hotel-info" + this.destID).appendChild(div)
        this.hotelID += 1
    }

    deleteHotel(hotelID) {
        this.hotels.splice(hotelID, 1)
        document.getElementById(`hotel-${this.destID}-${hotelID}`).remove()
        this.hotelID -= 1
    }

    addFlight() {
        this.flights[this.flightID] = {"HTML": `
            <img id= "flight-${this.destID}${this.flightID}-delete" name="deleteFlight" data-id="${this.destID}" data-flight-id="${this.flightID}" class="destination-icon" src="http://localhost:8081/images/delete_icon.png" alt="delete_icon">
            <textarea id="flight-name-${this.destID}${this.flightID}" type="text" name="flight-name" placeholder="Flight details"></textarea>`};
        let div = document.createElement('div');
        div.id = `flight-${this.destID}-${this.flightID}`
        div.className = 'flight-info-details';
        div.innerHTML = this.flights[this.flightID].HTML
        document.getElementById("flight-info" + this.destID).appendChild(div)
        this.flightID += 1
    }

    deleteFlight(flightID) {
        this.flights.splice(flightID, 1)
        document.getElementById(`flight-${this.destID}-${flightID}`).remove()
        this.flightID -= 1
    }

    async deleteDestination (event) {
        // Check if destination is last in array,
        //  if yes, just delete the last one
        //  if not, delete element and rebuild rest to give the right ID to all elements,
        let rebuild = false
        if (this.destID + 1 != destinations.length) {
            rebuild = true
        }

        // Find deleted destination index
        let deletedIndex = destinations.findIndex((element) => element.destID == this.destID)

        // Remove event listener
        document.getElementById("destID" + this.destID).removeEventListener("click", checkClickTarget)
        document.getElementById("destID" + this.destID).removeEventListener("change", checkChangeTarget)
        // Detele div from DOM
        document.getElementById("destID" + this.destID).remove()
        // Remove destination from destination array
        destinations.splice(deletedIndex, 1)
        if (rebuild == false) {
            // Reduce destID to continue with right numbering
            destID -= 1
        } else {
            // Remove all event listeners at once cloning the mytrips elements without event listeners
            let mytrips = document.getElementById('mytrips')
            mytrips.replaceWith(mytrips.cloneNode(true));
            // Remove all destinations from DOM
            document.getElementById("mytrips").innerHTML = `<strong>My trips:</strong>`
            // Set destID to number of destinations to give new destinations correct ID
            destID = destinations.length
            // Reprocess every remaining destination with new ID
            for (let index = 0; index < destinations.length; index++) {
                destinations[index].destID = index
                await destinations[index].addDestination()
            }
        }
        // Delete trip container if empty
        if (document.getElementById(this.tripName).childElementCount == 0) {
            document.getElementById(this.tripName).remove()
        }
        // // Check if order changed after delete
        checkDestOrder()
    }
}

async function fetchWeatherData (dest) {
    if (dest.daysToTrip < 15) {
        res = await Client.getWeatherbit(weatherbit_apikey, dest.lat, dest.long)
        dest.weatherbit = res
        for (let index = 0; index < res.data.length; index++) {
            dest.sunrise[index] = res.data[index].sunrise_ts
            dest.sunset[index] =  res.data[index].sunset_ts
            dest.weatherDate[index] = res.data[index].valid_date
            dest.tempMax[index] = res.data[index].max_temp
            dest.tempMin[index] = res.data[index].min_temp
            dest.apparentTempMax[index] = res.data[index].app_max_temp
            dest.apparentTempMin[index] = res.data[index].app_min_temp
            dest.relativeHumidity[index] = res.data[index].rh
            dest.cloudCoverage[index] = res.data[index].clouds
            dest.weatherIcon[index] = res.data[index].weather.icon
            dest.weatherDescription[index] = res.data[index].weather.description
            dest.rainProb[index] = res.data[index].pop
        }
    }
}

function checkChangeTarget (event){
    let targetDestID = event.target.getAttribute("data-id")
    let changedDestID = destinations.findIndex((element) => element.destID == targetDestID)
    let target = event.target.name
    switch (target) {
        case "startDate": case "endDate":
            if (document.getElementById("trip-end" + targetDestID).value < document.getElementById("trip-start" + targetDestID).value) {
                document.getElementById("trip-start" + targetDestID).value = moment(destinations[changedDestID].startDate).format("YYYY-MM-DD")
                document.getElementById("trip-end" + targetDestID).value = moment(destinations[changedDestID].endDate).format("YYYY-MM-DD")
                alert("End date is earlier than start date, please correct");
                break
            }
            console.log(target, "changed")
            destinations[changedDestID][target] = moment(event.target.value).format("YYYY-MM-DD")
            destinations[changedDestID].updateDatesAndWeather()
            stylePastTrips()
        case "startDate":
            checkDestOrder(destinations[changedDestID])
        case "hotel-arrival": case "hotel-departure":
            document.getElementById(event.target.id).setAttribute("value", moment(document.getElementById(event.target.id).value).format('YYYY-MM-DD'))
            break;
        case "hotel-name": case "flight-name":
            document.getElementById(event.target.id).innerHTML = document.getElementById(event.target.id).value
            break;
    }
}

function checkClickTarget (event){
    let targetDestID = event.target.getAttribute("data-id")
    let changedDestID = destinations.findIndex((element) => element.destID == targetDestID)
    switch (event.target.name) {
        case "addFlight":
            destinations[changedDestID].addFlight()
            break;
        case "deleteFlight":
            let flightID = event.target.getAttribute("data-flight-id")
            destinations[changedDestID].deleteFlight(flightID)
            break;
        case "addHotel":
            destinations[changedDestID].addHotel()
            break;
        case "deleteDestination":
            destinations[changedDestID].deleteDestination()
            break;
        case "deleteHotel":
            let hotelID = event.target.getAttribute("data-hotel-id")
            destinations[changedDestID].deleteHotel(hotelID)
            break;
    }
}

async function checkDestOrder(dest = "") {
    if (destinations.length <= 1) {
        return false
    }

    // Sort destinations array and save whether it was sorted
    let arraySorted = sortArray(destinations)

    //  Check if trips are in the right order
    // The earliest of all active destinations decides first trip)
    let sortedTripArray = []
    destinations.forEach(dest => {
        if (sortedTripArray.findIndex((element) => element == dest.tripName) < 0) {
            sortedTripArray.push(dest.tripName)
        }
    });

    if (arraySorted) {
        console.log("Sorting destinations")
        orderByStartDate(dest, sortedTripArray)
    }
}

function sortArray(array) {
    let arraySorted = false

    // Create copy of original array
    let originalArray = [...array]

    // Sort by start date from newest to oldest
    array.sort(function(a, b){
        let dateA = new Date(a.startDate).getTime()
        let dateB = new Date(b.startDate).getTime()
        return  dateA - dateB
    });

    // Create copy of ordered array
    let sortedArray = [...array]

    // Push past destinations (endDate < today()) to end
    for (let index = 0; index < sortedArray.length; index++) {
        if (moment(sortedArray[index].endDate).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) {
            array.push(array.shift());
        }
    }

    // Check if array changed
    for (let index = 0; index < array.length; index++) {
        if (array[index].destID != originalArray[index].destID) {
            arraySorted = true
        }
    }

    if (arraySorted) {
        console.log("Original array", originalArray, "New array", destinations)
    } else {
        console.log("Order didn´t change")
    }

    return arraySorted
}

function orderByStartDate(dest, sortedTripArray) {
    // // Sort destinations array
    // sortArray(destinations)
    // console.log("sorted", sortedDestArray, "unsorted", destinations)

    // Rebuild trips divs
    sortedTripArray.forEach(tripName => {
        // Rebuild DOM
        let element = document.getElementById(tripName)
        let parent = element.parentNode
        parent.appendChild(element);
    });

    // Rebuild destination array
    destinations.forEach(destination => {
        // Rebuild DOM
        let element = document.getElementById("destID" + destination.destID)
        let parent = element.parentNode
        parent.appendChild(element);

        // Reattach event listeners before rebuilding
        document.getElementById("destID" + destination.destID).addEventListener("click", checkClickTarget)
        document.getElementById("destID" + destination.destID).addEventListener("change", checkChangeTarget)
    });

    if (dest != "") {
        document.getElementById("destID"+dest.destID).scrollIntoView({block: "start", inline: "nearest", behavior: "smooth"});
    }
}

function stylePastTrips () {
    // Apply obsolte class if trip is in the past
    destinations.forEach(destination => {
        let element = document.getElementById("destID" + destination.destID)
        if (moment(destination.endDate).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) {
            element.classList.add("endDate-passed")
        } else {
            element.classList.remove("endDate-passed")
        }
    });
}

// Initialize values
window.addEventListener('DOMContentLoaded', async (event) => {
    let moment = require('moment')
    document.getElementById('trip-start').value = moment().add(3, 'days').format('YYYY-MM-DD')
    document.getElementById('trip-end').value = moment().add(6, 'days').format('YYYY-MM-DD')

    // Get API Keys
    Client.getApiKeys()
    .then(function(res){
        geonames_apikey = res.GEONAMES_USER_NAME
        pixabay_apikey = res.PIXABAY_APIKEY
        weatherbit_apikey = res.WEATHERBIT_APIKEY
    })

    // Initilize autocomplete
    cityArray = await createCitiesArray()
    $( "#city" ).autocomplete({
        source: cityArray
    })

    // Recreate last session
    await recreateSession()
    destID = destinations.length

    // Apply styles for past trips
    stylePastTrips()
});

// Recreate last session
function recreateSession() {
    if (localStorage.getItem('destinations') != "[]") {
        console.log("::: Building page from local storage :::")
        document.getElementById("mytrips").innerHTML = localStorage.getItem('travelAppSessionHTML')
        const localStorageDestinations = JSON.parse(localStorage.getItem('destinations'))
        console.log("::: Recreating destinations :::")
        for (let index = 0; index < localStorageDestinations.length; index++) {
            let destination = localStorageDestinations[index]
            let dest = new Destination(
                destination.tripName, destination.destID,
                destination.city, destination.daysToTrip, destination.startDate, destination.endDate, destination.tripDuration,
                destination.hotels, destination.hotelID, destination.flights, destination.flightID,
                destination.genonames, destination.long, destination.lat, destination.countryName,
                destination.pixabay, destination.cityImgWebURL, destination.cityImgDesc,
                destination.weatherbit, destination.weatherDate, destination.sunrise, destination.sunset,
                destination.tempMax, destination.tempMin, destination.apparentTempMax, destination.apparentTempMin,
                destination.relativeHumidity, destination.cloudCoverage, destination.weatherIcon,
                destination.weatherDescription, destination.rainProb)
            destinations[dest.destID] = dest
            document.getElementById("destID" + dest.destID).addEventListener("click", checkClickTarget)
            document.getElementById("destID" + dest.destID).addEventListener("change", checkChangeTarget)
        }
    }
};

export function saveSession(){
    localStorage.setItem('destinations', JSON.stringify(destinations))
    localStorage.setItem('travelAppSessionHTML', document.getElementById("mytrips").innerHTML)
}

async function createCitiesArray () {
    const csvFile = await (await fetch("http://localhost:8081/cities/cities500_reduced_city&country.txt")).text()
    let cityArray = csvFile.split("\n");
    return cityArray;
};

function test(event) {
}