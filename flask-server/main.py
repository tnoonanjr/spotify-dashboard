import spotipy
from spotipy.oauth2 import SpotifyOAuth
import json
from flask import Flask, redirect, render_template, request, session
from datetime import datetime
from constants import APP_SECRET, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPE 
import pprint as pp

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.secret_key = APP_SECRET

sp_oauth = SpotifyOAuth(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, redirect_uri=REDIRECT_URI, scope=SCOPE, show_dialog=True) # show dialog ensures the user will see the spotify login screen
sp = spotipy.Spotify(auth_manager=sp_oauth)

def logged_in() -> bool:
    return 'access_token' in session 

def _refresh():
    ''' Refreshes the auth token if necessary '''
    
    token_info = sp_oauth.get_cached_token()
    if token_info:
        expires_at = token_info['expires_at']
        if expires_at - datetime.now().timestamp() < 300:
            new_token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            session['access_token'] = new_token_info
            sp.auth_manager = SpotifyOAuth(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, 
                                           redirect_uri=REDIRECT_URI, scope=SCOPE, 
                                           token_info=new_token_info)


# backend routes
@app.route("/")
def index():
    '''
    Homepage endpoint

    Provides a warning for those not logged in if they try to reach an
    endpoint they must be logged in to access

    '''
    
    flash = False
    return render_template('home.html', flash=flash, logged_in=logged_in())

@app.route("/login")
def login():
    ''' 
    Login method 

    Calls the user to page spotify login page to give the webpage access to
    the permissions listed in the SCOPE

    '''
    pp.pprint('login method called')
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route("/logout")
def logout():
    ''' 
    Logout method 
    
    Clears the session of all data. all other routes require a token so only the home page is 
    now accessible.

    '''

    print('logout method called')
    session.clear()
    sp_oauth._save_token_info({})
    return redirect('/')

@app.route("/callback")
def callback():
    ''' 
    Callback method 

    This method is called after a login is successful to send the user
    back to the home page. 

    '''
    pp.pprint('callback method called')
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session['access_token'] = token_info
    return redirect('/')  

@app.route("/playlists")
def get_playlists():
    ''' 
    Playlist endpoint

    Displays all playlists on a user's profile that are public 
    and are owned by the user. 
    
    '''
    if not logged_in():     
        return render_template('home.html', flash=True, logged_in=False)

    _refresh()
    user_info = sp.current_user()
    user_id = user_info['id']
    
    all_playlists = sp.current_user_playlists()
    public_playlists = []
    for playlist in all_playlists['items']: 
        if playlist['public'] and playlist['owner']['id'] == user_id:
            public_playlists.append(playlist)

    jsonData = json.dumps({'items': public_playlists}) 
    return render_template('index.html', jsonData=jsonData)

@app.route("/playlist/<playlist_id>/tracks")
def tracks(playlist_id:str):
    ''' 
    Playlist tracklist endpoint
    
    Provides a list of tracks in a playlist.
     
    '''
    
    tracks = sp.playlist_tracks(playlist_id)
    jsonData = json.dumps(tracks)
    return render_template('tracks.html', tracks=tracks, jsonData=jsonData)

@app.route("/profile")
def profile():
    ''' 
    Profile endpoint

    Displays profile data of the current user.
    
    '''
    if not logged_in():      
        return render_template('home.html', flash=True, logged_in=False)
    
    _refresh()         

    profile_data = sp.current_user()
    
    # Fetch top tracks for each time frame
    short_term_tracks = get_top_tracks(time_range='short_term')
    medium_term_tracks = get_top_tracks(time_range='medium_term')
    long_term_tracks = get_top_tracks(time_range='long_term')

    # Fetch top artists for each time frame
    short_term_artists = get_top_artists(time_range='short_term')
    medium_term_artists = get_top_artists(time_range='medium_term')
    long_term_artists = get_top_artists(time_range='long_term')

    # Fetch queue
    user_queue = sp.queue()
    try: 
        currently_playing_info = extract_track_info(user_queue['currently_playing'])
        queue_info = [extract_track_info(track) for track in user_queue['queue']]
    
    except: 
        currently_playing_info = None
        queue_info = None

    jsonDataDict = {
        "profile": profile_data,
        "short_term_tracks": short_term_tracks,
        "short_term_artists": short_term_artists,
        "medium_term_tracks": medium_term_tracks,
        "medium_term_artists": medium_term_artists,
        "long_term_tracks": long_term_tracks,
        "long_term_artists": long_term_artists,
        'currently_playing': currently_playing_info,
        'queue': queue_info 
    }

    jsonData = json.dumps(jsonDataDict)
    pp.pprint(jsonData)
    return render_template("profile.html", jsonData=jsonData)

def extract_track_info(track):
    return {
        'name': track['name'],
        'artists': [artist['name'] for artist in track['artists']],
        'artists_ids': [artist['id'] for artist in track['artists']],
        'album': track['album']['name'],
        'duration_ms': track['duration_ms'],
        'cover': track['album']['images'][2]['url'],
        'popularity': track['popularity'],
    }

def get_top_tracks(time_range: str, limit: int = 10) -> list:
    ''' 
    Retrieves top 'n' tracks from Spotify 
    
    Also calls the refresh method to make sure a token is available and then outputs data 
    for the users top ten tracks in a given time frame.

    '''
    _refresh()
                
    top_tracks = sp.current_user_top_tracks(limit=limit, time_range=time_range)
    tracks_data = []  

    for track in top_tracks['items']:
        album_info = sp.album(track['album']['id'])
        tracks_data.append({
            'name': track['name'],
            'artists': ', '.join([song['name'] for song in track['artists']]),
            'album_image': album_info['images'][0]['url'],
            'artists_url': ', '.join([song['external_urls']['spotify'] for song in track['artists']])
        })
        
    return tracks_data

def get_top_artists(time_range: str, limit: int = 10) -> list:
    ''' 
    Gets top 'n' artists and returns a dictionary containing the artist's name, image, and url 
    to their Spotify page.

    '''
    _refresh()
            
    top_artists = sp.current_user_top_artists(limit=limit, time_range=time_range)
    artists_data = []  

    for artist in top_artists['items']:
        artists_data.append({
            'name': artist['name'],
            'artist_image': artist['images'][0]['url'],
            'artists_url': artist['external_urls']['spotify'],
            'id': artist['id']
        })

    return artists_data

@app.route('/artist/<artist_id>/profile')
def artist_profile(artist_id:str):
    ''' 
    Provides stats for a given artist and generates reccomendations in the 
    same genre as the artist 

    '''
    pp.pprint(' artist profile called ')
    artist_info = sp.artist(artist_id)
    artist_data = {
        'artists': {
            'items': [artist_info]
        }
    }

    suggest = sp.recommendations(seed_artists=[artist_id], limit=10)
    suggestion = [
    { 
        'image' : track['album']['images'][0],
        'track_name' : track['name'],
        'artists' : [artist['name'] for artist in track['artists']],
        'album' : track['album']['name'] if track['album']['name'] else None,
        'artists_id' : [artist['id'] for artist in track['artists']]
    }
    for track in suggest['tracks']]
    
    jsonData = json.dumps(artist_data, ensure_ascii=False)
    suggestion = json.dumps(suggestion, ensure_ascii=False)

    return render_template('artist.html', jsonData=jsonData, suggest=suggestion)

if __name__ == '__main__':
    app.run(debug=True)