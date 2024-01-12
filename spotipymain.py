import spotipy
from flask import Flask, render_template
from spotipy.oauth2 import SpotifyOAuth
from datetime import datetime
from flask import redirect, request

app = Flask(__name__)

CLIENT_ID = '********************************'
CLIENT_SECRET = '*****************************'
REDIRECT_URI = 'http://localhost:5000/callback'

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'
SCOPE = "user-read-private user-read-email user-top-read"

sp_oauth = SpotifyOAuth(client_id=CLIENT_ID, client_secret=CLIENT_SECRET, redirect_uri=REDIRECT_URI, scope=SCOPE)

@app.route("/")
def index():
    return render_template('home.html')

@app.route("/login")
def login():
    return redirect(sp_oauth.get_authorize_url())

@app.route("/callback")
def callback():
    token_info = sp_oauth.get_access_token(request.args['code'])

    return redirect("/profile")

@app.route("/home")
def home():
    return render_template('home.html')

@app.route('/profile')
def profile():
    
    sp = spotipy.Spotify(auth_manager=sp_oauth) 

    if sp_oauth.get_cached_token():
        token_info = sp_oauth.get_cached_token()
        expires_at = token_info['expires_at']
        
        if expires_at - datetime.now().timestamp() < 300:
            sp_oauth.refresh_access_token(token_info['refresh_token'])
    
    top_tracks = sp.current_user_top_tracks(limit=10, time_range='medium_term')  # Change time_range as needed
    
    tracks_data = []
    for track in top_tracks['items']:
        tracks_data.append({
            'name': track['name'],
            'artists': ', '.join([artist['name'] for artist in track['artists']])
        })
    
    profile_data = sp.current_user()

    return render_template("profile.html", tracks=tracks_data, profile=profile_data)

@app.route("/playlists")
def get_playlists():
    if not sp_oauth.get_cached_token():
        return redirect("/login")

    sp = spotipy.Spotify(auth_manager=sp_oauth)
    
    playlists = sp.current_user_playlists()
    
    return render_template('playlists.html', playlists=playlists)

if __name__ == '__main__':
    app.run(debug=True)
