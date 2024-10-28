var jsonDataElement = document.getElementById('jsonData');
var jsonData = JSON.parse(jsonDataElement.textContent);

// call the function to render playlist info
jsonData.items.forEach(function(playlist) 
{
    renderPlaylistInfo(playlist);
});


function renderPlaylistInfo(playlist) 
{
    /**
     * creates a div with each playlist given in the jsonData
     */
    var playlistInfoDiv = document.createElement('div');
    playlistInfoDiv.classList.add('item');

    
    // add image to playlist div
    var playlistCoverImg = document.createElement('img');
    playlistCoverImg.classList.add('playlist-cover', 'cover-img');
    playlistCoverImg.src = playlist.images[0].url;
    playlistCoverImg.alt = 'Playlist Image';
    playlistInfoDiv.appendChild(playlistCoverImg);
    playlistInfoDiv.appendChild(document.createElement('br'));
    

    // add anchor to tracks
    var playlistNameLink = document.createElement('a');
    playlistNameLink.classList.add('playlist-name');
    playlistNameLink.href = '/playlist/' + playlist.id + '/tracks';
    playlistNameLink.textContent = playlist.name;
    var playlistNameStrong = document.createElement('strong');
    playlistNameStrong.appendChild(playlistNameLink);
    playlistInfoDiv.appendChild(playlistNameStrong);
    playlistInfoDiv.appendChild(document.createElement('br'));

    if (playlist.description) 
    {
        var playlistDescriptionEm = document.createElement('em');
        playlistDescriptionEm.textContent = playlist.description;
        playlistInfoDiv.appendChild(playlistDescriptionEm);
        playlistInfoDiv.appendChild(document.createElement('br'));
    }

    // Append the created div to the playlist container
    document.getElementById('playlistContainer').appendChild(playlistInfoDiv);
}