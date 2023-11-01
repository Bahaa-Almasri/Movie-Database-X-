const apiKey = "";
const tmdbApiKey = "";

document.addEventListener("DOMContentLoaded", () => {
    const movieTitle = getMovieTitleFromQueryString();
    const releaseYear = getReleaseYearFromQueryString();

    function getMovieTitleFromQueryString() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get("title");
    }

    function getReleaseYearFromQueryString() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get("year");
    }

    // Function to fetch and populate movie details
    function fetchAndPopulateMovieDetails(title, year) {
        fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}&y=${encodeURIComponent(year)}`)
            .then(response => response.json())
            .then(data => {
                if (data) {

                    // <span>&nbsp;</span> adds a front space
                    document.getElementById("movieTitle").textContent = data.Title;
                    document.getElementById("movieTitle").classList.add("movie-title"); // Add this line to apply the CSS class

                    // Display the appropriate icon based on the movie type
                    let iconHtml = '';
                    if (data.Type === "movie") {
                        iconHtml = '<i class="fas fa-film"></i>';
                    } else if (data.Type === "series") {
                        iconHtml = '<i class="fas fa-tv"></i>';
                    }

                    const capitalizedType = data.Type.charAt(0).toUpperCase() + data.Type.slice(1);
                    document.getElementById("movieType").innerHTML = `
                        <i class="fas fa-film"></i> <span>&nbsp;</span><b>Type:</b><span>&nbsp;</span>${capitalizedType}
                    `;

                    document.getElementById("movieReleaseDate").innerHTML = `
                        <i class="far fa-calendar-alt"></i> <span>&nbsp;</span><b>Release Date:</b><span>&nbsp;</span>${data.Released}
                    `;
                    document.getElementById("movieRating").innerHTML = `
                        <i class="fas fa-star"></i> <span>&nbsp;</span><b>IMDb Rating:</b><span>&nbsp;</span>${data.imdbRating} <i class="fas fa-star" style="color: yellow;"></i>
                    `;
                    document.getElementById("movieGenre").innerHTML = `
                    <i class="fas fa-theater-masks"></i> <span>&nbsp;</span><b>Genre:</b><span>&nbsp;</span>${data.Genre}
                    `;
                    document.getElementById("moviePlot").innerHTML = `
                        <i class="fas fa-align-left"></i> <span>&nbsp;</span><b>Plot:</b><span>&nbsp;</span>${data.Plot}
                    `;
                    document.getElementById("movieCast").innerHTML = `
                        <i class="fas fa-users"></i> <span>&nbsp;</span><b>Main Cast:</b><span>&nbsp;</span>${data.Actors}
                    `;
                    document.getElementById("movieLanguage").innerHTML = `
                        <i class="fas fa-language"></i> <span>&nbsp;</span><b>Language:</b><span>&nbsp;</span>${data.Language}
                    `;
                    document.getElementById("movieAwards").innerHTML = `
                        <i class="fas fa-award"></i> <span>&nbsp;</span><b>Nominations:</b><span>&nbsp;</span>${data.Awards}
                    `;
                    document.getElementById("movieBoxOffice").innerHTML = `
                        <i class="fas fa-money-bill"></i> <span>&nbsp;</span><b>Box Office:</b><span>&nbsp;</span>${data.BoxOffice}
                    `;

                    if (data.Poster) {
                        document.getElementById("movieImage").src = data.Poster;
                        document.getElementById("movieImage").alt = `${data.Title} Poster`;
                    }
                }
            })
            .catch(error => console.error(error));
    }

    // Toggle style function
    const toggleStyleButton = document.getElementById("toggleStyleButton");
    toggleStyleButton.addEventListener("click", () => {
        toggleStylesheet();
    });

// Function to toggle stylesheets and save user preference to local storage
function toggleStylesheet() {
    const currentStylesheet = document.getElementById("stylesheet-details").getAttribute("href");
    const newStylesheet = currentStylesheet === "style-details.css" ? "light-style-details.css" : "style-details.css";
    const newButtonCont = newStylesheet === "style-details.css" ? "Light Theme" : "Dark Theme";
    document.getElementById("stylesheet-details").setAttribute("href", newStylesheet);
    document.getElementById("toggleStyleButton").textContent = newButtonCont;
    localStorage.setItem("selectedStylesheet", newStylesheet);
    localStorage.setItem("selectedCont", newButtonCont);
}

// Check local storage for user's preferred stylesheet
const selectedStylesheet = localStorage.getItem("selectedStylesheet");
if (selectedStylesheet) {
    document.getElementById("stylesheet-details").setAttribute("href", selectedStylesheet);
}

// Check local storage for user's preferred button text
const selectedButton = localStorage.getItem("selectedCont");
if (selectedButton) {
    document.getElementById("toggleStyleButton").textContent = selectedButton;
}

    // Call the fetchAndPopulateMovieDetails function
    fetchAndPopulateMovieDetails(movieTitle, releaseYear);
});
