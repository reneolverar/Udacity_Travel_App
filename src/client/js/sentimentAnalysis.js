// API call
export async function sentimentAnalysisCheck (text, textType, apiKey) {

    // API call input
    const formdata = new FormData();
    formdata.append("key", apiKey);

    // TEXT/URL Selector
    if (textType == "Text"){
        formdata.append("txt", text);
    }
    else {formdata.append("url", text);}

    formdata.append("lang", "en");  // 2-letter code, like en es fr ...

    const requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
    }

    const res = await fetch("https://api.meaningcloud.com/sentiment-2.1", requestOptions);
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