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