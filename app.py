from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask import send_from_directory
import os

app = Flask(__name__)
CORS(app)

# 🎵 Только локальные треки (без API)
TRACKS = [
    {"id": 1, "title": "Summer Vibes", "artist": "Pixabay", 
     "url": "https://moosic.my.mail.ru/file/42932d576bc79cbd1e95ddfdb5dcdc9f.mp3",
     "duration": "3:45"},
    {"id": 2, "title": "Chill Beats", "artist": "Audio Library",
     "url": "https://moosic.my.mail.ru/file/3597faf7437f781cdd3da897b98a3a4c.mp3",
     "duration": "4:20"},
    {"id": 3, "title": "Electronic Dream", "artist": "Free Music",
     "url": "https://moosic.my.mail.ru/file/ec5b764296d23bf91e75a0b3d49971fd.mp3",
     "duration": "2:55"},
    {"id": 4, "title": "Acoustic Morning", "artist": "Bensound",
     "url": "https://moosic.my.mail.ru/file/ddda74f6bd7b1384bac69052c60f43c8.mp3",
     "duration": "3:10"},
    {"id": 5, "title": "Jazz Cafe", "artist": "FMA",
     "url": "https://moosic.my.mail.ru/file/56a12a60f5a2202be0ed52c18f167581.mp3",
     "duration": "4:05"},
    {"id": 6, "title": "Ambient Flow", "artist": "Piапппап",
     "url": "https://moosic.my.mail.ru/file/588746078840a1e57802f98061854877.mp3",
     "duration": "3:30"},
    {"id": 7, "title": "Upbeat Energy", "artist": "Audio Library",
     "url": "https://moosic.my.mail.ru/file/ec5b764296d23bf91e75a0b3d49971fd.mp3",
     "duration": "2:45"},
    {"id": 8, "title": "Peaceful Mind", "artist": "Free Music",
     "url": "https://moosic.my.mail.ru/file/6615b9b23989c1ecc32d5be6338ad39e.mp3",
     "duration": "4:15"},
    {"id": 9, "title": "Night Drive", "artist": "Pixabay",
     "url": "https://cdn.pixabay.com/audio/2022/03/15/audio_5f8f6d3c8e.mp3",
     "duration": "3:50"},
    {"id": 10, "title": "Happy Day", "artist": "Audio Library",
     "url": "https://cdn.pixabay.com/audio/2022/02/22/audio_1f9c5f8c8e.mp3",
     "duration": "3:20"},
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tracks')
def get_tracks():
    return jsonify(TRACKS)

@app.route('/api/track/<int:track_id>')
def get_track(track_id):
    track = next((t for t in TRACKS if t['id'] == track_id), None)
    return jsonify(track) if track else (jsonify({"error": "Not found"}), 404)

@app.route('/manifest.json')
def manifest():
    return app.send_static_file('../manifest.json')


@app.route('/sw.js')
def service_worker():
    return app.send_static_file('../sw.js')

if __name__ == '__main__':

    app.run(debug=True, host='0.0.0.0', port=5000)
