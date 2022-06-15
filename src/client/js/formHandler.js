export function handleSubmit(event) {
    event.preventDefault()
    console.log("::: Form Submitted :::")
    document.getElementById('results').innerHTML = ""

    let message = ""
    let apiKey = ""
    // Check if input choice (radio button) is text or url
    let textType = checkTextType()

    // Get input value
    const formText = document.getElementById('name').value

    // Check if input is empty
    if (formText == "") {
        document.getElementById('results').innerHTML = "Please enter a text or url to search"
    }
    // Check if URL is entered but a text is chosen
    else if (textType == "Text" && isValidURL(formText)) {
        document.getElementById('results').innerHTML = "You entered an URL, please select the URL option";
    }
    // Check if URL is valid
    else if (textType == "URL" && !isValidURL(formText)) {
        document.getElementById('results').innerHTML = "Please enter a valid URL to search";
    }
    else {
        // Fetch API KEY from server
        console.log("Fetching API key from server");
        fetch('http://localhost:8081/apiKey')
        .then(res => res.text())
        .then(function(res){
            apiKey = res
        })

        // Calling API with the webpack environment
        console.log("Fetching API data for a: " + textType);

        document.getElementById('results').innerHTML = "Processing results..."

        Client.sentimentAnalysisCheck(formText, textType, apiKey)
        .then(function(sentimentAnalysis){
            message = `API Call Sentiment analysis results: <br>
                    <br>
                    Text excerpt: ${sentimentAnalysis.sentence_list[0].text} <br>
                    <br>
                    Total results:<br>
                    Polarity: ${sentimentAnalysis.score_tag} <br>
                    Agreement: ${sentimentAnalysis.agreement} <br>
                    Subjectivity: ${sentimentAnalysis.subjectivity} <br>
                    Irony: ${sentimentAnalysis.irony} <br>
                    Confidence: ${sentimentAnalysis.confidence}`
        })
        .then(function(sentimentAnalysis){
            document.getElementById('results').innerHTML = message
        })
    }
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