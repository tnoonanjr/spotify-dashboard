var jsonDataElement = document.getElementById("jsonData");
var jsonData = JSON.parse(jsonDataElement.textContent);

function renderPlaylistTracks(tracks) 
{
    /**  Creates a list of all tracks in a given playlist */
    var container = document.getElementById("tracks-container");
    const trackList = document.createElement("ol");
    trackList.classList.add("track-list");

    tracks.forEach(function (item) 
    {
        var track = item.track;
        
        const trackLi = document.createElement("li");
        const trackTxt = document.createElement("strong");

        const trackLink = document.createElement("a");
        trackLink.classList.add("track-link"); 
        trackLink.href = track.external_urls.spotify;
        trackLink.target = "_blank"
        trackLink.textContent = `${track.name} - ${track.artists[0].name}`;
        
        trackTxt.appendChild(trackLink);
        trackLi.appendChild(trackTxt);

        trackList.appendChild(trackLi);    
    });
    
    
    container.appendChild(trackList);
}

renderPlaylistTracks(jsonData.items);