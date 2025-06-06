const urls = [
    {
        displayName: "Google",
        urlScheme: "https://www.google.com/search?q="
    },
    {
        displayName: "YouTube",
        urlScheme: "https://youtube.com/results?search_query="
    },
    {
        displayName: "DuckDuckGo",
        urlScheme: "https://duckduckgo.com/?q="
    },
    {
        displayName: "Translate (日本語)",
        urlScheme: "https://translate.google.ca/?sl=ja&tl=en&op=translate&text="
    },
];
let selectedUrl = 0;

const searchBar = document.querySelector("#search-bar");
const searchButton = document.querySelector("#search-button");
const searchTitle = document.querySelector("#search-text");

const search = (searchQuery) => {
    searchQuery = searchQuery.trim();

    if (searchQuery != "") {
        const searchUrl = encodeURI(urls[selectedUrl].urlScheme + searchQuery)
        chrome.tabs.update(undefined, {"url": searchUrl});
    }
}

document.querySelectorAll("#qa-button-container button").forEach((button) => {
    button.addEventListener("click", () => {
        selectedUrl = Number(button.getAttribute("id").replace("qa-button-", "")) - 1;
        searchTitle.textContent = urls[selectedUrl].displayName;
        searchBar.focus();
    })
});

document.querySelectorAll(".focus-search-bar").forEach((div) => {
    div.addEventListener("click", () => searchBar.focus());
});

searchButton.addEventListener("click", () => search(searchBar.value));

searchBar.addEventListener("keydown", (key) => {
    if (key.code == "Enter") {
        search(searchBar.value);
    }
})