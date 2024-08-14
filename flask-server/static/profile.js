window.onload = function() {
    openTab(event, 'short-div');
};

const jsonDataElement = document.getElementById('jsonData');
const jsonData = JSON.parse(jsonDataElement.textContent);
const currUser = jsonData.profile.display_name

function renderProfileInfo() {
    /**  Renders all information for a given user by parsing the jsonData **/
    var jsonDataElement = document.getElementById('jsonData');
    var jsonData = JSON.parse(jsonDataElement.textContent);
        
        var userProfileDiv = document.querySelector('.user-profile');

        var profile = jsonData.profile;

        // Profile picture
        var images = profile.images;    
        var profileImage = document.createElement('img');
        profileImage.src = images[0].url     

        // Display name
        var externalUrls = profile.external_urls;
        var profileHeader = document.createElement('h1');
        var profileName = document.createElement('a');
        profileName.textContent = currUser
        profileName.href = externalUrls.spotify;
        profileName.target = '_blank';
        profileHeader.appendChild(profileName);
        
        userProfileDiv.appendChild(profileImage);
        userProfileDiv.appendChild(profileHeader);  
}

renderProfileInfo()

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "flex";
    if (evt) {
        evt.currentTarget.className += " active";
    } 

    var tracks, artists;
    switch (tabName) {
        case 'short-div':
            tracks = jsonData.short_term_tracks;
            artists = jsonData.short_term_artists;
            break;
        case 'med-div':
            tracks = jsonData.medium_term_tracks;
            artists = jsonData.medium_term_artists;
            break;
        case 'long-div':
            tracks = jsonData.long_term_tracks;
            artists = jsonData.long_term_artists;
            break;
        default:
            tracks = [];
            artists = [];
    }

    var container = document.getElementById(tabName);
    container.innerHTML = '';

    var flexContainer = document.createElement('div');
    flexContainer.id = tabName + '-flex-container'; // unique ID
    flexContainer.className = 'flex-container';
    container.appendChild(flexContainer);

    renderTopTracks(tracks, flexContainer.id);
    renderTopArtists(artists, flexContainer.id);
    if (jsonData.currently_playing) {
        const queueData = {
            currently_playing: jsonData.currently_playing,
            queue: jsonData.queue
        };
        renderQueue(queueData, flexContainer.id);
    }
    
}

function renderTopTracks(tracks, containerId) {
    /** 
     * Renders the user's top ten most listened tracks by looping 
     * over each track given by the jsonData 
     **/
    var container = document.getElementById(containerId);  

    var trackList = document.createElement('ol');
    trackList.classList.add('top-tracks'); 

    // Loop 10x tracks
    tracks.forEach(function(track) {
        let trackName = track.name;
        // Truncate if over 50 chars
        if (trackName.length > 50) {
            trackName = trackName.substring(0, 50).trimEnd() + '...';
        }
        
        // Parent element
        var trackItem = document.createElement('li');
        trackItem.classList.add('track-item'); 
        
        // Cover image
        var trackCover = document.createElement('img');
        trackCover.classList.add('track-cover');
        trackCover.src = track.album_image;
        trackCover.alt = 'No image found';
        
        // Wrap track text
        var trackTxtWrapper = document.createElement('div');
        trackTxtWrapper.classList.add('track-txt-wrapper'); 
        
        // Track name
        var trackNameElem = document.createElement('p');
        trackNameElem.id = 'track'; 
        trackNameElem.classList.add('track-txt'); 
        trackNameElem.textContent = trackName;
        
        // Artist names
        var artistWrapper = document.createElement('div');
        artistWrapper.classList.add('artist-wrapper'); 
        
        let artists = track.artists.split(', ');
        let artistUrls = track.artists_url.split(', ');

        for (let i = 0; i < artists.length; i++) {
            var artistAnchor = document.createElement('a');
            artistAnchor.id = 'artist'; 
            artistAnchor.classList.add('track-txt'); 
            
            // Trim artist URL for artist id
            let trimmedUrl = artistUrls[i].trim();
            let lastSlashIndex = trimmedUrl.lastIndexOf('/');
            let artistId = trimmedUrl.substring(lastSlashIndex + 1);

            artistAnchor.href = `/artist/${artistId}/profile`;
            artistAnchor.innerHTML = artists[i] + (i < artists.length - 1 ? ',&nbsp' : '');

            artistWrapper.appendChild(artistAnchor);
        }

        trackTxtWrapper.appendChild(trackNameElem);
        trackTxtWrapper.appendChild(artistWrapper);

        trackItem.appendChild(trackCover);
        trackItem.appendChild(trackTxtWrapper);
        
        trackList.appendChild(trackItem);
    });

    container.appendChild(trackList);
}

function renderTopArtists(artists, containerId) {
    /**
     * Renders the user's top artists with a link to their profile page
     */
    var container = document.getElementById(containerId);  
    var artistList = document.createElement('ol');
    artistList.classList.add('top-artists');

    artists.forEach(function(artist) {
        // Create item
        var artistItem = document.createElement('li');
        artistItem.classList.add('artist-item');
        
        // Cover image
        var artistImg = document.createElement('img');
        artistImg.classList.add('artist-img', 'cover-img');
        artistImg.src = artist.artist_image;
        artistImg.alt = 'No image found';
        
        // Artist name
        var artistAnchor = document.createElement('a');
        artistAnchor.classList.add('artist-txt');
        artistAnchor.href = '/artist/' + artist.id + '/profile';
        artistAnchor.textContent = artist.name;
        
        artistItem.appendChild(artistImg);
        artistItem.appendChild(artistAnchor);
        
        artistList.appendChild(artistItem);
    });
    container.appendChild(artistList);
}

function renderQueue(queueData, containerId) {
    /** 
     * Displays the user's current queue 
     */ 
    console.log('rendering queue');
    console.log(queueData);
    var container = document.getElementById(containerId)
    var queueList = document.getElementById('queue-ol');
    queueList.classList.add('top-tracks');
    

    // Queue Label
    const queueLabel = document.createElement('li');
    queueLabel.classList.add('top-tracks');
    const userPossessive = currUser.match(/s$/i) ? `${currUser}'` : `${currUser}'s`;
    queueLabel.textContent = `${userPossessive} queue`;
    queueLabel.id = "queue-list-lbl";

    queueList.appendChild(queueLabel)

    function createQueueItem(track) {
        /** 
         * Helper function that will parse the inputted JSON and display the track information
         */
        const queueItem = document.createElement('li');
        queueItem.classList.add("track-item", 'suggest-item')

        // Track cover
        const trackCover = document.createElement('img');
        trackCover.classList.add('track-cover')
        trackCover.src = track.cover
        trackCover.alt = 'No image found'
       
        // Track info div wrapper
        const trackTextWrapper = document.createElement('div');
        trackTextWrapper.classList.add('track-txt', 'queue-info-div');

        // Name
        const trackName = document.createElement('p');
        trackName.id = 'track'
        trackName.classList.add('track-txt')
        trackName.textContent = track.name;

        // Artists
        const artistWrapper = document.createElement('div');
        
        artistWrapper.classList.add('artist-wrapper');

        track.artists.forEach((artist, index) => {
            const artistAnchor = document.createElement('a');
            artistAnchor.classList.add('track-txt');

            // Create artist URL with artist ID
            const artistId = track.artists_ids[index];
            artistAnchor.id = 'artist'
            artistAnchor.href = `/artist/${artistId}/profile`;
            artistAnchor.textContent = artist;

            artistWrapper.appendChild(artistAnchor);
            if (index < track.artists.length - 1) {
                artistAnchor.innerHTML += ',&nbsp;';  // Comma separator
            }
        });

        trackTextWrapper.appendChild(trackName);
        trackTextWrapper.appendChild(artistWrapper);

        // Album
        const trackAlbum = document.createElement('p');
        trackAlbum.id = "artist"
        trackAlbum.classList.add("suggest-track", "suggest-item", "queue-album")
        trackAlbum.textContent = track.album;

        // Duration
        const trackDuration = document.createElement('p');
        trackDuration.id = 'artist'
        trackDuration.classList.add('duration')
        const trackDurationMs = track.duration_ms;
        const trackDurationTotSec = Math.floor(trackDurationMs / 1000);
        const trackDurationMins = Math.floor(trackDurationTotSec / 60);
        let trackDurationSec = trackDurationTotSec % 60;

        trackDurationSec = trackDurationSec < 10 ? `0${trackDurationSec}` : trackDurationSec;
        trackDuration.textContent = `${trackDurationMins}:${trackDurationSec}`;
        
        queueItem.appendChild(trackCover);
        queueItem.appendChild(trackTextWrapper);
        queueItem.appendChild(trackAlbum);
        queueItem.appendChild(trackDuration);

        return queueItem;
    }

    const currItem = createQueueItem(queueData.currently_playing);
    queueList.appendChild(currItem);

    for (let i = 0; i < 9; i++) {
        const track = queueData.queue[i];
        const queueItem = createQueueItem(track);
        queueList.appendChild(queueItem);
    }
    container.appendChild(queueList);
}