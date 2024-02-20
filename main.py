import spotipy
from spotipy.oauth2 import SpotifyOAuth
from flask import Flask, render_template, redirect, jsonify, session, request
from datetime import datetime
from constants import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPE, APP_SECRET
import json

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.secret_key = APP_SECRET

sp_oauth = SpotifyOAuth(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, redirect_uri=REDIRECT_URI, scope=SCOPE)

# method class object to make app routes readable 
class WxlfifyMethods:
    @staticmethod  
    def _refresh():
        if sp_oauth.get_cached_token():
            token_info = sp_oauth.get_cached_token()
            expires_at = token_info['expires_at']

            if expires_at - datetime.now().timestamp() < 300:
                sp_oauth.refresh_access_token(token_info['refresh_token'])

    @staticmethod
    def get_top_tracks(time_range, limit=10):
        ''' allows us to retrieve top tracks from Spotify '''
        WxlfifyMethods._refresh()
        sp = spotipy.Spotify(auth_manager=sp_oauth) 

        if sp_oauth.get_cached_token():
            token_info = sp_oauth.get_cached_token()
            expires_at = token_info['expires_at']
            
            if expires_at - datetime.now().timestamp() < 300:
                sp_oauth.refresh_access_token(token_info['refresh_token'])
        
        top_tracks = sp.current_user_top_tracks(limit=limit, time_range=time_range)
    
        tracks_data = []
        for track in top_tracks['items']:
            album_info = sp.album(track['album']['id'])
            tracks_data.append({
                'name': track['name'],
                'artists': ', '.join([artist['name'] for artist in track['artists']]),
                'album_image': album_info['images'][0]['url'] if album_info.get('images') else None
            })
        
        return tracks_data

# backend endpoints
@app.route("/")
def index():
    ''' default endpoint '''
    return render_template('home.html')

@app.route("/login")
def login():
    ''' login endpoint '''
    return redirect(sp_oauth.get_authorize_url())

@app.route("/callback")
def callback():
    ''' callback endpoint '''
    token_info = sp_oauth.get_access_token(request.args['code'])
    session['token_info'] = token_info

    return redirect("/home")

# web page endpoints 
@app.route('/home')
def home():
    ''' main page '''
    return render_template('home.html')

@app.route("/profile")
def profile():
    ''' profile page showing most played tracks '''
    sp = spotipy.Spotify(auth_manager=sp_oauth)         # initialize class object     

    if sp_oauth.get_cached_token():
        token_info = sp_oauth.get_cached_token()
        expires_at = token_info['expires_at']

        if expires_at - datetime.now().timestamp() < 300:
            sp_oauth.refresh_access_token(token_info['refresh_token'])

    
    # Fetch top tracks for different time frames
    short_term_tracks = WxlfifyMethods.get_top_tracks(time_range='short_term')
    medium_term_tracks = WxlfifyMethods.get_top_tracks(time_range='medium_term')
    long_term_tracks = WxlfifyMethods.get_top_tracks(time_range='long_term')

    profile_data = sp.current_user()

    return render_template("profile.html", short_term_tracks=short_term_tracks, medium_term_tracks=medium_term_tracks, long_term_tracks=long_term_tracks, profile=profile_data)

@app.route("/playlists")
def get_playlists():
    ''' display all playlists on a user's profile '''
    sp = spotipy.Spotify(auth_manager=sp_oauth)
    WxlfifyMethods._refresh()
    
    playlists = sp.current_user_playlists()
    jsonData = json.dumps(playlists)    # changed to json 
    print(jsonData)
    return render_template('index.html', playlists=playlists, jsonData=jsonData)  # changed to index

@app.route("/playlist/<playlist_id>/tracks")
def tracks(playlist_id):
    ''' list of tracks in a playlist '''
    sp = spotipy.Spotify(auth_manager=sp_oauth)
    tracks = sp.playlist_tracks(playlist_id)
    return render_template('tracks.html', tracks=tracks)

if __name__ == '__main__':
    app.run(debug=True)