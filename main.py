import requests
import urllib.parse

from flask import Flask, redirect, request, jsonify, session, render_template
from flask_cors import CORS
from datetime import datetime


app = Flask(__name__)
CORS(app)
app.secret_key = '************'

# constants
CLIENT_ID = '****************************'
CLIENT_SECRET = '*******************************'
REDIRECT_URI = 'http://localhost:5000/callback'

AUTH_URL = 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'

# login/backend endpoints
@app.route("/")
def index():
    return render_template('home.html')

@app.route("/login")
def login():
    scope = "user-read-private user-read-email user-top-read"

    parameters = { 
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'scope': scope,
        'redirect_uri': REDIRECT_URI,
        'show_dialog': True # testing
    } 

    login_auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(parameters)}"

    return redirect(login_auth_url)


@app.route("/callback")
def callback():
    if 'error' in request.args:
        return jsonify({'error': requests.args('error')})
    
    if 'code' in request.args:
        req_body = {
            'code': request.args['code'],
            'grant_type': 'authorization_code', 
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        }

    response = requests.post(TOKEN_URL, data=req_body)
    token_info = response.json()

    session['access_token'] = token_info['access_token'] 
    session['refresh_token'] = token_info['refresh_token']
    session['expires_at'] = datetime.now().timestamp() + token_info['expires_in']

    return redirect("/playlists")

@app.route("/refresh-token")
def refresh_token():
    if 'refresh_token' not in session:
        return redirect("/login")
    
    if datetime.now().timestamp() > session['expires_at']:
        req_body = {
            'grant_type':'refresh_token',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'refresh_token': session['refresh_token'],
        }
        
        response = requests.post(TOKEN_URL, data=req_body)
        new_token_info = response.json()

        session['access_token'] = new_token_info['access_token']
        session['expires_at'] = datetime.now().timestamp() + new_token_info['expires_in']

    return redirect("/playlists")

#endpoints
@app.route("/home")
def home():
    return render_template('home.html')

@app.route("/profile")
def profile(): 
    if 'access_token' not in session:
        return redirect("/login")
    
    if datetime.now().timestamp() > session['expires_at']:
        return redirect("/refresh-token") 
          
    headers = {'Authorization': f"Bearer {session['access_token']}"} 

    response = requests.get("https://api.spotify.com/v1/me", headers=headers)
    profile = response.json()
    
    return render_template('profile.html', profile=profile)

@app.route("/playlists")
def get_playlists():
    if 'access_token' not in session:
        return redirect("/login")
    
    if datetime.now().timestamp() > session['expires_at']:
        return redirect("/refresh-token") 
    
    headers = {'Authorization': f"Bearer {session['access_token']}"}

    response = requests.get(f"{API_BASE_URL}me/playlists", headers=headers)
    playlists = response.json() 

    return render_template('playlists.html', playlists=playlists)

@app.route("/playlist/<playlist_id>/tracks")
def get_playlist_tracks(playlist_id):
    if 'access_token' not in session:
        return redirect("/login")
    
    if datetime.now().timestamp() > session['expires_at']:
        return redirect("/refresh-token") 
    
    headers = {'Authorization': f"Bearer {session['access_token']}"}

    offset = 0  # Initialize the offset to 0
    all_tracks = []  # List to store all tracks
    while True: 
        response = requests.get(f"{API_BASE_URL}playlists/{playlist_id}/tracks", headers=headers, params={'limit': 50, 'offset': offset})
        tracks = response.json()

        if 'items' not in tracks or len(tracks['items']) == 0:
            # No more tracks to retrieve
            break
        all_tracks.extend(tracks['items'])
        
        # Increment the offset for the next iteration
        offset += 50
    
    return render_template("tracks.html", tracks={'items': all_tracks})

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
