import unittest 
import spotipy 
from spotipy.oauth2 import SpotifyClientCredentials, CacheFileHandler
from main import app
from constants import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPE
from datetime import datetime

class TestApp(unittest.TestCase):
    def setUp(self) -> None:
        app.testing = True
        self.app = app.test_client()

        self.auth_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
        self.sp = spotipy.Spotify(auth_manager=self.auth_manager) 
    
    def test_login(self):
        ''' test redirect static code '''
        response = self.app.get('/login')
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.headers['Location'].startswith('https://accounts.spotify.com/authorize'))
    
    def test_home(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)


    def test_playlists(self):
        response = self.app.get('/playlists')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'<strong><a class="playlist-name" href="/playlist/', response.data)
        self.assertIn(b'<em>', response.data)

unittest.main()