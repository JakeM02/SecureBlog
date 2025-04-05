// DOM-Based XSS vulnerable code
const params = new URLSearchParams(window.location.search);
const query = params.get("q");

if (query) {
    document.getElementById("results-header").innerHTML = "You searched for: " + query;
}
