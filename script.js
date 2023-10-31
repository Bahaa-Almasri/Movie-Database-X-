// Scroll to the top when the page is reloaded
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.onbeforeunload = () => {
    window.scrollTo(0, 0);
};

// Function to show the preloader
function showPreloader() {
    const preloader = document.getElementById("preloader");
    preloader.style.display = "block"; // Show the preloader
}

// Function to hide the preloader
function hidePreloader() {
    const preloader = document.getElementById("preloader");
    preloader.style.display = "none"; // Hide the preloader
}

// Show the preloader
showPreloader();

// Listen for the "load" event of the page
window.onload = () => {
    // Calculate the time elapsed since showing the preloader
    const elapsedTime = new Date() - startTime;

    // If less than 500ms have passed, wait for the remaining time
    const remainingTime = 500 - elapsedTime;
    if (remainingTime > 0) {
        setTimeout(hidePreloader, remainingTime);
    } else {
        hidePreloader();
    }
};

// Record the start time when the script is loaded
const startTime = new Date();

let styleIndex = localStorage.getItem('styleIndex') || 0;
const stylesheetDetails = document.getElementById('stylesheet-details');

const styles = [
    { stylesheet: 'style.css', preloaderImage: 'preloader.gif', text: "Light Theme", details: "style-details.css" },
    { stylesheet: 'light-style.css', preloaderImage: 'light-preloader.gif', text: "Dark Theme", details: "light-style-details.css" }
];

function applyStyle() {
    const selectedStyle = styles[styleIndex];
    const stylesheetLink = document.getElementById('stylesheet');
    const preloaderImage = document.querySelector('#preloader img');
    const styleToggleBtn = document.getElementById('styleToggle');

    stylesheetLink.href = selectedStyle.stylesheet;
    preloaderImage.src = selectedStyle.preloaderImage;
    styleToggleBtn.textContent = selectedStyle.text;
}

function toggleStyle() {
    styleIndex = (styleIndex + 1) % styles.length; // Toggle between stylesheets
    applyStyle();

    // Save the selected style index to local storage
    localStorage.setItem('styleIndex', styleIndex);
}

// Call applyStyle() after the page loads to apply the saved style or default style
window.addEventListener('load', applyStyle);

const apiKey = "4ee0f515";
const tmdbApiKey = "175573440a7c61926149eb3bd90c26d4";

const searchButton = document.getElementById("searchButton");
const homeLink = document.getElementById("homeLink");
const moviesLink = document.getElementById("moviesLink");
const tvShowsLink = document.getElementById("tvShowsLink");
const movieList = document.querySelector(".movie-list");

searchButton.addEventListener("click", () => {
    const movieListElements = document.getElementsByClassName("movie-list");

    for (const element of movieListElements) {
        element.style.display = "";
    }

    hideSuggestions();
    // Hide everything in the movie-list div
    movieList.innerHTML = '';
    const searchTerm = document.getElementById("searchInput").value;
    searchMovies(searchTerm);

    var newTerm = searchTerm.trimEnd().trimStart();

    // Set the heading text and show it
    mediaTypeHeading.textContent = `Showing Search Results For: "${newTerm}"`;
    mediaTypeHeading.style.display = "block";

    hideSuggestions();
    hidePopularMedia();
    hideHighestRated();
    hideNewReleases();
    moviesLink.classList.remove("active");
    tvShowsLink.classList.remove("active");
    homeLink.classList.add("active");
});

homeLink.addEventListener("click", () => {
    showLoader();
    window.location.reload(); // Reload the page
    hideLoader();
});

function hideMainDiv() {
    const mainDiv = document.getElementById("main-div");
    mainDiv.style.display = "none"; // Hide the Main div
}


function hideNewReleases() {
    const newReleasesSection = document.querySelector('.new-releases');
    if (newReleasesSection) {
        newReleasesSection.remove();
    }
}

function hideHighestRated() {
    const highestRatedMovies = document.querySelector('.highest-rated-movies');
    if (highestRatedMovies) {
        highestRatedMovies.remove();
    }
    const highestRatedTvShows = document.querySelector('.highest-rated-tv-shows');
    if (highestRatedTvShows) {
        highestRatedTvShows.remove();
    }
}

// Fetch a random popular movie from TMDB
fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}`)
    .then(response => response.json())
    .then(data => {
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];

        // Update the movie title and poster
        document.getElementById("movieTitle").textContent = randomMovie.title;
        document.getElementById("movieImage").src = `https://image.tmdb.org/t/p/w500/${randomMovie.poster_path}`;

        // Use the random movie's title and release year to fetch details from OMDB
        fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(randomMovie.title)}&y=${randomMovie.release_date.split('-')[0]}`)
            .then(response => response.json())
            .then(data => {
                const releaseDate = data.Released ? data.Released : randomMovie.release_date;
                document.getElementById("releaseDate").textContent = `Release Date: ${releaseDate}`;

                // Add release date to releaseDate class
                const releaseDateElement = document.querySelector(".releaseDate");
                if (releaseDateElement) {
                    releaseDateElement.textContent = releaseDate;
                }

                if (data.imdbRating) {
                    const imdbRating = data.imdbRating;
                    document.getElementById("movieRating1").innerHTML = `
                        <b>IMDb Rating:</b> ${imdbRating} <i class="fas fa-star" style="color: yellow;"></i>
                    `;
                } else {
                    // Fetch additional details directly from TMDB
                    fetch(`https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${tmdbApiKey}`)
                        .then(response => response.json())
                        .then(details => {
                            const imdbRating = details.vote_average;
                            document.getElementById("movieRating1").innerHTML = `
                                <b>IMDb Rating:</b> ${imdbRating} <i class="fas fa-star" style="color: yellow;"></i>
                            `;
                        })
                        .catch(error => console.error(error));
                }

                if (data.Plot) {
                    const movieDescription = data.Plot;
                    document.getElementById("movieDescription").innerHTML = `
                        <b>Plot:</b> ${movieDescription}
                    `;
                } else {
                    // Fetch additional details directly from TMDB
                    fetch(`https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${tmdbApiKey}`)
                        .then(response => response.json())
                        .then(details => {
                            if (details.overview) {
                                const movieDescription = details.overview;
                                document.getElementById("movieDescription").innerHTML = `
                                    <b>Plot:</b> ${movieDescription}
                                `;
                            } else {
                                document.getElementById("movieDescription").innerHTML = "Description not available.";
                            }
                        })
                        .catch(error => console.error(error));
                }

                if (data.Genre) {
                    const movieGenres = data.Genre;
                    document.getElementById("movieGenres").innerHTML = `
                        <b>Genre:</b> ${movieGenres}
                    `;
                } else {
                    // Fetch additional details directly from TMDB
                    fetch(`https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${tmdbApiKey}`)
                        .then(response => response.json())
                        .then(details => {
                            if (details.genres && details.genres.length > 0) {
                                const movieGenres = details.genres.map(genre => genre.name).join(", ");
                                document.getElementById("movieGenres").innerHTML = `
                                    <b>Genre:</b> ${movieGenres}
                                `;
                            } else {
                                document.getElementById("movieGenres").innerHTML = "Genres not available.";
                            }
                        })
                        .catch(error => console.error(error));
                }

                document.getElementById("movieDetails").innerHTML = `
                <a class="movie-details-link" href="movie-details.html?title=${encodeURIComponent(data.Title || randomMovie.title)}&year=${encodeURIComponent(data.Year || randomMovie.release_date.split('-')[0])}">More Details</a>
                `;
            })
            .catch(error => console.error(error));
        // If release date not found on OMDB, use TMDB's release date
        const releaseDate = randomMovie.release_date;
        document.getElementById("releaseDate").textContent = `Release Date: ${releaseDate}`;

        // Add release date to releaseDate class
        const releaseDateElement = document.querySelector(".releaseDate");
        if (releaseDateElement) {
            releaseDateElement.textContent = releaseDate;
        }
    })
    .catch(error => console.error(error));

function searchMovies(searchTerm) {
    const loader = document.getElementById("loader");
    loader.style.display = "block"; // Show the loader while loading

    const resultsPerPage = 10; // Number of results per page
    let currentPage = 1; // Start with the first page
    let totalResults = 0; // Total number of results across all pages
    const movieDetailsMap = new Map(); // Map to store movie details with titles as keys
    const movieDetailsArray = []; // Array to store movie details
    const maxPages = 5; // Maximum number of pages to fetch

    const fetchNextPage = () => {
        if (currentPage > maxPages) {
            // If we've reached the maximum number of pages to fetch, stop fetching
            const uniqueMovieDetails = Array.from(movieDetailsMap.values());
            uniqueMovieDetails.sort((a, b) => b.imdbRating - a.imdbRating); // Sort by highest rating
            displayMovies(uniqueMovieDetails);
            document.getElementById("searchInput").value = ""; // Clear the input field
            loader.style.display = "none"; // Hide the loader when loading is done
            return;
        }

        fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}&page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                if (data.Search) {
                    totalResults = parseInt(data.totalResults);
                    const promises = data.Search.map(movie => {
                        return fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(movie.Title)}`)
                            .then(response => response.json());
                    });

                    Promise.all(promises)
                        .then(details => {
                            details.forEach(detail => {
                                const movieDetail = {
                                    title: detail.Title,
                                    releaseYear: detail.Year ? parseInt(detail.Year) : 0,
                                    imdbRating: detail.imdbRating ? parseFloat(detail.imdbRating) : 0,
                                    genres: detail.Genre ? detail.Genre.split(", ") : []
                                };
                                movieDetailsArray.push(movieDetail);

                                if (!movieDetailsMap.has(detail.Title)) {
                                    movieDetailsMap.set(detail.Title, detail); // Add movie detail to the Map
                                }
                            });

                            currentPage++;

                            fetchNextPage(); // Fetch the next page if there are more results
                        })
                        .catch(error => {
                            console.error(error);
                            loader.style.display = "none"; // Hide the loader in case of an error
                        });
                }
            })
            .catch(error => console.error(error));
    };

    fetchNextPage(); // Start fetching the first page

    // Save the searched term to local storage
    saveSearchTermToLocalStorage(searchTerm);

    hideSuggestions();
    document.getElementById("searchInput").value = ""; // Clear the input field
    hideMainDiv();
    hidePopularMedia();
    hideHighestRated();
    hideNewReleases();
}

function saveSearchTermToLocalStorage(searchTerm) {
    const savedSearches = JSON.parse(localStorage.getItem("searchedItems")) || [];

    if (!savedSearches.includes(searchTerm)) {
        savedSearches.push(searchTerm);
        localStorage.setItem("searchedItems", JSON.stringify(savedSearches));
    }
}

function clearSavedSearches() {
    localStorage.removeItem("searchedItems");
    const savedSearchesContainer = document.getElementById("savedSearchesContainer");
    savedSearchesContainer.innerHTML = ""; // Clear saved search items from the container
}

function removeSearchTermFromLocalStorage(searchTerm) {
    const savedSearches = JSON.parse(localStorage.getItem("searchedItems")) || [];

    const updatedSearches = savedSearches.filter(term => term !== searchTerm);
    localStorage.setItem("searchedItems", JSON.stringify(updatedSearches));
}

function displayMovies(movieArray) {
    movieList.innerHTML = "";
    movieArray.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");

        // Determine the capitalized type
        const capitalizedType = movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1);

        movieElement.innerHTML = `
        <button class="bookmark-button"><i class="fas fa-bookmark"></i></button> <!-- Bookmark Button -->
        <div class="movie-image">
            <img src="${movie.Poster}" alt="No Poster Available">
        </div>
        <div class="movie-info">
            <h3 class="movie-title"> ${movie.Title}</h3>
            <p class="movie-year">Release Year: ${movie.Year}</p>
            <p class="movie-rating">IMDb Rating: ${movie.imdbRating} <i class="fas fa-star" style="color: yellow;"></i></p>
            <p class="movie-genre">Genre: ${movie.Genre}</p>
            <p class="movie-type">Type: ${capitalizedType}</p>
            <a class="movie-details-link" href="movie-details.html?title=${encodeURIComponent(movie.Title)}&year=${encodeURIComponent(movie.Year)}">More Details</a>
        </div>
    `;
        movieList.appendChild(movieElement);

        const bookmarkButton = movieElement.querySelector('.bookmark-button');
        const localStorageKey = `bookmark-${encodeURIComponent(movie.Title)}-${encodeURIComponent(movie.Year)}`;

        // Check if the movie is already bookmarked in local storage
        const isBookmarked = localStorage.getItem(localStorageKey) === 'true';
        if (isBookmarked) {
            bookmarkButton.classList.add('bookmarked');
        }

        bookmarkButton.addEventListener('click', () => {
            bookmarkButton.classList.toggle('bookmarked');

            // Update local storage when the bookmark button is clicked
            if (bookmarkButton.classList.contains('bookmarked')) {
                localStorage.setItem(localStorageKey, 'true');
            } else {
                localStorage.removeItem(localStorageKey);
            }
        });

    });
}

function searchMoviesByCategory(category, type) {
    const totalPages = 10; // Adjust the number of pages you want to fetch
    const minRating = 6; // Minimum rating to consider
    const minMoviesToShow = 20; // Minimum number of movies to display

    const selectedMovieTitles = []; // Array to store selected movie titles

    const promises = [];

    for (let page = 1; page <= totalPages; page++) {
        promises.push(
            fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${category}&type=${type}&page=${page}`)
                .then(response => response.json())
                .then(data => {
                    if (data.Search) {
                        const uniqueMovies = data.Search.filter(movie => {
                            return !selectedMovieTitles.includes(movie.Title);
                        });
                        selectedMovieTitles.push(...uniqueMovies.map(movie => movie.Title));
                        hideLoader();
                    }
                })
                .catch(error => console.error(error))
        );
    }

    Promise.all(promises)
        .then(() => {
            if (selectedMovieTitles.length >= minMoviesToShow) {
                const detailPromises = selectedMovieTitles.map(title => {
                    return fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(title)}`)
                        .then(response => response.json());
                });

                Promise.all(detailPromises)
                    .then(details => {
                        const filteredDetails = details.filter(detail => {
                            return detail.imdbRating && parseFloat(detail.imdbRating) >= minRating;
                        });

                        displayMovies(filteredDetails);
                    })
                    .catch(error => console.error(error));
            } else {
                console.log("Not enough unique titles found across all pages.");
            }
        })
        .catch(error => console.error(error));
}

// Function to remove the initial black box random
async function fetchRandomMedia(type) {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${type}&type=${type}`);
    const data = await response.json();
    if (data.Search) {
        const randomIndexes = getRandomIndexes(data.Search.length, 0); // Get 5 random indexes
        const randomMedia = randomIndexes.map(index => data.Search[index]);
        return randomMedia;
    } else {
        return [];
    }
}

// Function to get an array of random indexes
function getRandomIndexes(maxIndex, count) {
    const indexes = [];
    while (indexes.length < count) {
        const randomIndex = Math.floor(Math.random() * maxIndex);
        if (!indexes.includes(randomIndex)) {
            indexes.push(randomIndex);
        }
    }
    return indexes;
}

async function fetchAndDisplayRandomMedia() {
    try {
        // Fetch random movies and TV shows
        const randomMovies = await fetchRandomMedia("movie");
        const randomTVShows = await fetchRandomMedia("series");
        const randomMedia = randomMovies.concat(randomTVShows);

        // Fetch additional details for random media
        const promises = randomMedia.map(media => {
            return fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(media.Title)}`)
                .then(response => response.json());
        });

        Promise.all(promises)
            .then(details => {
                // Display the random media with details
                displayMovies(details);
            })
            .catch(error => console.error(error));
    } catch (error) {
        console.error("Error fetching random media:", error);
    }
}

function displaySavedSearches() {
    const savedSearches = JSON.parse(localStorage.getItem("searchedItems")) || [];

    const savedSearchesContainer = document.getElementById("savedSearchesContainer");
    savedSearchesContainer.innerHTML = ""; // Clear existing content

    savedSearches.forEach(searchTerm => {
        const savedSearchElement = document.createElement("div");
        savedSearchElement.classList.add("suggestion"); // Apply the same class as search suggestions
        savedSearchElement.classList.add("saved-search"); // Additional class for styling
        savedSearchElement.innerHTML = `
            <div class="suggestion-details">
                <p class="suggestion-title">${searchTerm}</p>
                <button class="delete-button">×</button>
            </div>
        `;

        const deleteButton = savedSearchElement.querySelector(".delete-button");
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent the click event from propagating to the parent element
            removeSearchTermFromLocalStorage(searchTerm);
            displaySavedSearches(); // Refresh the displayed search terms
        });

        savedSearchElement.addEventListener("click", () => {

            const movieListElements = document.getElementsByClassName("movie-list");

            for (const element of movieListElements) {
                element.style.display = "";
            }

            // Hide everything in the movie-list div
            movieList.innerHTML = '';
            hideSuggestions();
            hidePopularMedia();
            hideMainDiv();
            searchMovies(searchTerm); // Search for the saved item

            // Set the heading text and show it
            mediaTypeHeading.textContent = `Showing Search Results For: "${searchTerm}"`;
            mediaTypeHeading.style.display = "block";

            moviesLink.classList.remove("active");
            tvShowsLink.classList.remove("active");
            homeLink.classList.add("active");

        });

        savedSearchesContainer.appendChild(savedSearchElement);
    });

    isSuggestionsVisible = true; // Suggestions are now visible
}

const searchInput = document.getElementById("searchInput");
const suggestionsContainer = document.getElementById("suggestionsContainer");
let isSuggestionsVisible = false; // To track if suggestions are visible

searchInput.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (isSuggestionsVisible) {
        hideSuggestions();
    } else if (searchTerm === "") {
        displaySavedSearches();
    }
    // Show saved searches container when clicking on the search input
    savedSearchesContainer.style.display = "block";
    isSavedSearchesVisible = true;
});

searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm.length > 0) {
        fetchSearchSuggestions(searchTerm);
        savedSearchesContainer.style.display = "none";
        isSavedSearchesVisible = false;
    } else {
        displaySavedSearches();
        savedSearchesContainer.style.display = "block";
        isSavedSearchesVisible = true;
    }
});

// Hide saved searches container when clicking outside the search input and suggestions container
document.addEventListener("click", event => {
    if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target) && isSavedSearchesVisible) {
        savedSearchesContainer.style.display = "none";
        isSavedSearchesVisible = false;
    }
    if (!suggestionsContainer.contains(event.target) && isSuggestionsVisible) {
        hideSuggestions();
    }
});

// Hide suggestions when clicking outside the suggestions container
document.addEventListener("click", event => {
    if (!suggestionsContainer.contains(event.target) && isSuggestionsVisible) {
        hideSuggestions();
    }
});

function fetchSearchSuggestions(searchTerm) {
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}`)
        .then(response => response.json())
        .then(data => {
            if (data.Search) {
                const promises = data.Search.map(item => {
                    return fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(item.Title)}`)
                        .then(response => response.json());
                });

                Promise.all(promises)
                    .then(movieDetails => {
                        const suggestions = movieDetails.map(detail => ({
                            title: detail.Title,
                            rating: detail.imdbRating ? detail.imdbRating : "N/A", // Fix for missing rating
                            poster: detail.Poster
                        }));
                        displaySearchSuggestions(suggestions);
                    })
                    .catch(error => console.error(error));
            }
        })
        .catch(error => console.error(error));
}

function displaySearchSuggestions(suggestions) {
    suggestionsContainer.innerHTML = "";
    const shownTitles = new Set(); // To track already shown titles

    suggestions.forEach(suggestion => {
        if (!shownTitles.has(suggestion.title)) {
            shownTitles.add(suggestion.title);
            const suggestionElement = document.createElement("div");
            suggestionElement.classList.add("suggestion");
            suggestionElement.addEventListener("click", () => {
                window.location.href = `movie-details.html?title=${encodeURIComponent(suggestion.title)}`;
                searchInput.value = ""; // Clear the search input after clicking on a suggestion
                hideSuggestions();
            });

            const ratingHtml = suggestion.rating
                ? `<b>Rating: <b> ${suggestion.rating} <i class="fas fa-star" style="color: yellow;"></i>`
                : "Rating: N/A";

            suggestionElement.innerHTML = `
                <img src="${suggestion.poster}" alt="No Poster Available" class="suggestion-poster">
                <div class="suggestion-details">
                    <p class="suggestion-title">${suggestion.title}</p>
                    <p class="suggestion-rating">${ratingHtml}</p>
                </div>
            `;

            suggestionsContainer.appendChild(suggestionElement);
        }
    });

    isSuggestionsVisible = true; // Suggestions are now visible
}

function hideSuggestions() {
    suggestionsContainer.innerHTML = "";
    isSuggestionsVisible = false; // Suggestions are now hidden
}

async function displayMediaDetails(media, container) {
    const mediaElement = document.createElement("div");
    mediaElement.classList.add("media");

    const mediaType = media.title ? "movie" : "tv show";
    const capitalizedType = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);

    const releaseYear = media.release_date ? media.release_date.split("-")[0] : media.first_air_date.split("-")[0];

    let ratingSource = ""; // To track the source of the rating
    let rating = "N/A"; // Default rating value

    if (mediaType === "movie") {
        const omdbResponse = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(media.title)}&y=${releaseYear}`);
        const omdbData = await omdbResponse.json();
        rating = omdbData.imdbRating ? omdbData.imdbRating : "N/A";
        ratingSource = "OMDB";
    } else {
        rating = media.vote_average || "N/A";
        ratingSource = "TMDB";
    }

    const mediaTitle = media.title || media.name; // Store the media title

    const mediaKey = `bookmark-${encodeURIComponent(mediaTitle)}-${encodeURIComponent(releaseYear)}`;

    // Check if the media is already bookmarked in local storage
    const isBookmarked = localStorage.getItem(mediaKey) === 'true';

    mediaElement.innerHTML = `
    <div class="media-image">
        <img src="https://image.tmdb.org/t/p/w500/${media.poster_path}" alt="No Poster Available">
    </div>
    <div class="media-info">
        <h3 class="media-title">${mediaTitle}</h3>
        <button class="bookmark-button"><i class="fas fa-bookmark"></i></button> <!-- Bookmark Button -->
        <p class="media-release">Release Year: ${releaseYear}</p>
        <p class="media-rating">IMDb Rating: ${rating} <i class="fas fa-star" style="color: yellow;"></i></p>
        <p class="media-genre">Type: ${capitalizedType}</p>
        <a class="movie-details-link" href="movie-details.html?title=${encodeURIComponent(mediaTitle)}&year=${encodeURIComponent(releaseYear)}">More Details</a>
    </div>
`;

    const bookmarkButton = mediaElement.querySelector('.bookmark-button');

    // Set initial bookmark state based on local storage
    if (isBookmarked) {
        bookmarkButton.classList.add('bookmarked');
    }

    bookmarkButton.addEventListener('click', () => {
        bookmarkButton.classList.toggle('bookmarked');

        // Update local storage when the bookmark button is clicked
        if (bookmarkButton.classList.contains('bookmarked')) {
            localStorage.setItem(mediaKey, 'true');
        } else {
            localStorage.removeItem(mediaKey);
        }
    });

    container.appendChild(mediaElement);
}

// Event listener when the DOM is loaded
async function displayPopularMedia() {
    try {
        const responseMovies = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}&language=en-US&page=1`);
        const dataMovies = await responseMovies.json();

        const responseTVShows = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${tmdbApiKey}&language=en-US&page=1`);
        const dataTVShows = await responseTVShows.json();

        const popularMoviesContainer = document.querySelector('.popular-movies');
        const popularTVShowsContainer = document.querySelector('.popular-tv-shows');

        dataMovies.results.forEach(movie => {
            displayMediaDetails(movie, popularMoviesContainer);
        });

        dataTVShows.results.forEach(tvShow => {
            displayMediaDetails(tvShow, popularTVShowsContainer);
        });

        initializeMediaNavigation(popularMoviesContainer);
        initializeMediaNavigation(popularTVShowsContainer);
    } catch (error) {
        console.error('Error fetching or displaying data:', error);
    }
}

// Add a reference to the media type heading element
const mediaTypeHeading = document.getElementById("mediaTypeHeading");

// Event listener for Movies link
moviesLink.addEventListener("click", () => {
    const movieListElements = document.getElementsByClassName("movie-list");

    for (const element of movieListElements) {
        element.style.display = ""; // Set display style to empty string
    }

    // Set the heading text and show it
    mediaTypeHeading.textContent = "Recommended Movies";
    mediaTypeHeading.style.display = "block";

    // Clear movie list and show loader
    movieList.innerHTML = '';
    showLoader();

    // Search and display movies
    searchMoviesByCategory("movie", "movie");
    hidePopularMedia();
    hideMainDiv();
    hideHighestRated();
    hideNewReleases();
});

// Event listener for TV Shows link
tvShowsLink.addEventListener("click", () => {
    const movieListElements = document.getElementsByClassName("movie-list");

    for (const element of movieListElements) {
        element.style.display = ""; // Set display style to empty string
    }

    // Set the heading text and show it
    mediaTypeHeading.textContent = "Recommended TV Shows";
    mediaTypeHeading.style.display = "block";

    // Clear movie list and show loader
    movieList.innerHTML = '';
    showLoader();

    // Search and display TV shows
    searchMoviesByCategory("series", "series");
    hidePopularMedia();
    hideMainDiv();
    hideHighestRated();
    hideNewReleases();
});

function showLoader() {
    const loader = document.getElementById("loader");
    loader.style.display = "block"; // Show the loader
}

function hideLoader() {
    const loader = document.getElementById("loader");
    loader.style.display = "none"; // Hide the loader
}

function hidePopularMedia() {
    const popularMediaElements = document.querySelectorAll('.popular-media');
    popularMediaElements.forEach(element => {
        element.style.display = "none"; // Hide each element with class "popular-media"
    });
}

// Event listener for the Enter key press in the search input
searchInput.addEventListener("keydown", event => {
    const movieListElements = document.getElementsByClassName("movie-list");

    for (const element of movieListElements) {
        element.style.display = "";
    }

    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default form submission behavior
        hideSuggestions();
        // Hide everything in the movie-list div
        movieList.innerHTML = '';
        const searchTerm = searchInput.value;
        searchMovies(searchTerm);

        var newTerm = searchTerm.trimEnd().trimStart();

        // Set the heading text and show it
        mediaTypeHeading.textContent = `Showing Search Results For: "${newTerm}"`;
        mediaTypeHeading.style.display = "block";

        // Clear the search input
        searchInput.value = "";
        hideSuggestions();
        hidePopularMedia();
        hideHighestRated();
        hideNewReleases();
        moviesLink.classList.remove("active");
        tvShowsLink.classList.remove("active");
        homeLink.classList.add("active");
    }
});

// Inside your 'DOMContentLoaded' event listener
document.addEventListener("DOMContentLoaded", () => {
    const movieListElements = document.getElementsByClassName("movie-list");

    for (const element of movieListElements) {
        element.style.display = "none";
    }

    displayPopularMedia();
    displayHighestRatedMedia(); // Call the new function to display highest rated media
    displayNewReleases();
});

// New function to display highest rated movies and TV shows
async function displayHighestRatedMedia() {
    try {
        const highestRatedMovies = await fetchHighestRatedMedia("movie");
        const highestRatedTVShows = await fetchHighestRatedMedia("tv");

        const highestRatedMoviesContainer = document.querySelector('.highest-rated-movie-list');
        const highestRatedTVShowsContainer = document.querySelector('.highest-rated-tv-show-list');

        highestRatedMovies.forEach(movie => {
            displayMediaDetails(movie, highestRatedMoviesContainer);
        });

        highestRatedTVShows.forEach(tvShow => {
            displayMediaDetails(tvShow, highestRatedTVShowsContainer);
        });

        initializeMediaNavigation(highestRatedMoviesContainer);
        initializeMediaNavigation(highestRatedTVShowsContainer);
    } catch (error) {
        console.error('Error fetching or displaying highest rated media:', error);
    }
}

async function fetchHighestRatedMedia(mediaType) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/top_rated?api_key=${tmdbApiKey}&language=en-US&page=1`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(`Error fetching highest rated ${mediaType}s:`, error);
        return [];
    }
}

// Add this function to fetch and display new releases
async function displayNewReleases() {
    try {
        const responseMovies = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=release_date.desc&page=1&primary_release_year=2023`);
        const dataMovies = await responseMovies.json();

        const responseTVShows = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${tmdbApiKey}&language=en-US&sort_by=first_air_date.desc&page=1&first_air_date_year=2023`);
        const dataTVShows = await responseTVShows.json();

        const newReleasesContainer = document.querySelector('.new-releases-list');
        const newReleasesMedia = [];

        // Combine the results from movies and TV shows
        const allMedia = dataMovies.results.concat(dataTVShows.results);

        // Randomly shuffle the media array
        const shuffledMedia = shuffleArray(allMedia);

        // Display a maximum of 20 media items
        const maxItems = 20;
        const displayedMedia = shuffledMedia.slice(0, maxItems);

        displayedMedia.forEach(media => {
            displayMediaDetails(media, newReleasesContainer);
        });

        initializeMediaNavigation(newReleasesContainer);
    } catch (error) {
        console.error('Error fetching or displaying new releases:', error);
    }
}

// Function to shuffle an array randomly
function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementsByClassName("movie-list").style.display = "none";

    displayPopularMedia();
    displayHighestRatedMedia();
    displayNewReleases();
});

const watchListLink = document.getElementById("watchListLink");

document.addEventListener("DOMContentLoaded", function () {

    // Set Home as active link by default
    homeLink.classList.add("active");

    // Function to handle link clicks
    function handleLinkClick(linkElement) {
        homeLink.classList.remove("active");
        moviesLink.classList.remove("active");
        tvShowsLink.classList.remove("active");
        linkElement.classList.add("active");
    }

    // Handle TV Shows link click
    tvShowsLink.addEventListener("click", function (event) {
        event.preventDefault();
        handleLinkClick(tvShowsLink);
    });

    // Handle Movies link click
    moviesLink.addEventListener("click", function (event) {
        event.preventDefault();
        handleLinkClick(moviesLink);
    });
    /*
        watchListLink.addEventListener("click", function (event) {
            event.preventDefault();
            handleLinkClick(watchListLink);
        });
    */

    // Handle Home link click
    homeLink.addEventListener("click", function (event) {
        event.preventDefault();
        handleLinkClick(homeLink);
    });
});

/*
async function displayBookmarkedMedia(container) {
    container.innerHTML = ""; // Clear the container

    // Loop through local storage and display bookmarked media
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("bookmark-") && localStorage.getItem(key) === 'true') {
            const [mediaTitle, releaseYear] = key.replace("bookmark-", "").split("-");
            const mediaKey = `bookmark-${encodeURIComponent(mediaTitle)}-${encodeURIComponent(releaseYear)}`;

            const mediaData = JSON.parse(localStorage.getItem(mediaKey));

            const mediaElement = document.createElement("div");
            mediaElement.classList.add("media");

            const mediaType = mediaData.title ? "movie" : "tv show";
            const capitalizedType = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);

            const imdbRating = mediaData.imdbRating ? mediaData.imdbRating : "N/A";
            const movieDescription = mediaData.Plot ? mediaData.Plot : "Description not available.";
            const movieGenres = mediaData.Genre ? mediaData.Genre : "Genres not available.";

            // Construct media element using bookmarked data
            mediaElement.innerHTML = `
                <div class="media-image">
                    <img src="${mediaData.Poster}" alt="${mediaTitle} Poster">
                </div>
                <div class="media-info">
                    <h3 class="media-title">${mediaTitle}</h3>
                    <button class="bookmark-button bookmarked"><i class="fas fa-bookmark"></i></button> <!-- Bookmark Button -->
                    <p class="media-release">Release Year: ${releaseYear}</p>
                    <p class="media-rating">IMDb Rating: ${imdbRating} <i class="fas fa-star" style="color: yellow;"></i></p>
                    <p class="media-genre">Type: ${capitalizedType}</p>
                    <p class="media-description">${movieDescription}</p>
                    <p class="media-genres">${movieGenres}</p>
                    <a class="movie-details-link" href="movie-details.html?title=${encodeURIComponent(mediaTitle)}&year=${encodeURIComponent(releaseYear)}">More Details</a>
                </div>
            `;

            container.appendChild(mediaElement);
        }
    }

    hidePreloader(); // Call the hidePreloader() function after adding bookmarks
}

watchListLink.addEventListener("click", function () {

    const movieListElements = document.getElementsByClassName("movie-list");

    for (const element of movieListElements) {
        element.style.display = "";
    }

    hideSuggestions();
    // Hide everything in the movie-list div
    movieList.innerHTML = '';
    showLoader();

    // Set the heading text and show it
    mediaTypeHeading.textContent = "Your Watch List";
    mediaTypeHeading.style.display = "block";

    hideSuggestions();
    hideMainDiv();
    hideHighestRated();
    hideNewReleases();
    hidePopularMedia();

    displayBookmarkedMedia(movieList);
});
*/