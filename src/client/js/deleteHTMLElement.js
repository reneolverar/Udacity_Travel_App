// Delete HTML Element
export function deleteHTMLElement (event) {
    console.log(event.target.parentElement.parentElement.parentElement.id)
    document.getElementById(event.target.parentElement.parentElement.id).innerHTML = ""
}