// Parsing data
var jsonDataElement = document.getElementById('jsonData');
var jsonData = JSON.parse(jsonDataElement.textContent);
var suggestElement = jsonDataElement.getAttribute('data-suggest');
var suggestData = JSON.parse(suggestElement);

function renderArtistProfile(jsonData, suggestData) 
{
    /**
     * Renders a given artist's profile displaying their name,
     * popularity, similar artists, and more.
     */
    var items = jsonData.artists.items;
    var artistData = items[0];
    const artistProfileContainer = document.getElementById('artist-profile');

    // Image, name, followers sub-div
    const artistIdDiv = document.createElement('div');
    artistIdDiv.id = 'artist-id-div';

    // Profile image
    const artistImg = document.createElement('img');
    artistImg.src = artistData.images[2].url;
    artistImg.id = "artist-img";
    artistImg.classList.add('cover-img');
    artistIdDiv.appendChild(artistImg);

    // Artist name
    const artistName = document.createElement('p');
    artistName.id = "artist-name";
    artistName.textContent = artistData.name;
    artistIdDiv.appendChild(artistName);

    // Followers
    const artistFollowers = document.createElement('p');
    artistFollowers.id = 'follower-count';
    artistFollowers.textContent = `${artistData.followers.total} followers`;
    artistIdDiv.appendChild(artistFollowers);

    // Popularity
    const artistPopDiv = document.createElement('div');
    artistPopDiv.id = "artist-pop";

    const artistPopLbl = document.createElement('p');
    artistPopLbl.id = "artist-pop-lbl";
    artistPopLbl.textContent = "Popularity:";

    const artistPopNum = document.createElement('p');
    artistPopNum.id = "artist-pop-num";
    const popStr = artistData.popularity.toString();
    artistPopNum.textContent = `${popStr[0]}.${popStr[1]}`;
    artistPopDiv.appendChild(artistPopLbl);
    artistPopDiv.appendChild(artistPopNum);
    artistIdDiv.appendChild(artistPopDiv);

    // Genres
    const genresContainer = document.createElement('div');
    genresContainer.id = 'genres-container';
    artistData.genres.forEach(genre => 
    {
        const artistGenre = document.createElement('p');
        artistGenre.textContent = genre;
        artistGenre.classList.add("artist-genre");
        genresContainer.appendChild(artistGenre);
    });

    artistProfileContainer.appendChild(genresContainer);
    artistProfileContainer.appendChild(artistIdDiv);

    // Recommended tracks
    const recommendedLabel = document.createElement('h1');
    recommendedLabel.id = 'recommended-label';
    recommendedLabel.textContent = 'Recommended:'
    artistProfileContainer.appendChild(recommendedLabel)

    // For loop iterating over each suggestion
    suggestData.forEach((suggestion) => {
        const suggestItem = document.createElement('div');
        suggestItem.classList.add('suggest-item');

        const suggestCoverImg = document.createElement('img');
        suggestCoverImg.src = suggestion.image.url;
        suggestCoverImg.classList.add('track-cover');
        suggestItem.appendChild(suggestCoverImg);
        
        // Div for track name, artist, and album
        const trackInfoDiv = document.createElement('div');
        trackInfoDiv.classList.add('track-info-div');

        // Track name
        const suggestTrackName = document.createElement('p');
        suggestTrackName.textContent = suggestion.track_name;
        if (suggestTrackName.textContent.length > 32) suggestTrackName.textContent = suggestTrackName.textContent.substring(0, 32).trimEnd() + '...';
        
        suggestTrackName.classList.add('top-songs', 'suggest-track-name');
        trackInfoDiv.appendChild(suggestTrackName);

        // Create artist anchor elements
        suggestion.artists.forEach((artist, j) => 
        {
            const suggestArtist = document.createElement('a');
            suggestArtist.textContent = artist + (j < suggestion.artists.length - 1 ? ', ' : '');
            suggestArtist.id = 'artist';
            suggestArtist.classList.add('top-songs', 'suggest-track');
            suggestArtist.href = `/artist/${suggestion.artists_id[j]}/profile`;
            trackInfoDiv.appendChild(suggestArtist);
        });

        const suggestAlbumName = document.createElement('p');
        suggestAlbumName.textContent = suggestion.album;
        suggestAlbumName.id = 'artist';
        suggestAlbumName.classList.add('suggest-track', 'suggest-album');

        
        trackInfoDiv.appendChild(suggestAlbumName);
        suggestItem.appendChild(trackInfoDiv);

        artistProfileContainer.appendChild(suggestItem);
    });
}

renderArtistProfile(jsonData, suggestData);