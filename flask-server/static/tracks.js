var jsonDataElement = document.getElementById("jsonData");
var jsonData = JSON.parse(jsonDataElement.textContent);
console.log(jsonData)

function renderPlaylistTracks(tracks) {
    // creates a list of all tracks in a given playlist
    var container = document.getElementById("tracks-container");
    var trackList = '';
    trackList += '<ol class="track-list">'

    tracks.forEach(function (item) {
        var track = item.track;
        
        trackList += '<li>';
        trackList += '<strong>';
        trackList += '<a class="track-link" href="' + track.external_urls.spotify + '" target="_blank">';
        trackList += track.name;
        trackList += '</a>';
        trackList += '</strong> - ';
        trackList += track.artists[0].name;
        trackList += '</li>';
        
    });
    trackList += '</ol>';
    container.innerHTML += trackList
}

renderPlaylistTracks(jsonData.items);