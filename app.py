from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask import send_from_directory
import os

app = Flask(__name__)
CORS(app)

# 🎵 Только локальные треки (без API)
TRACKS = [
    {"id": 1, "title": "Он тебя целует", "artist": "Руки Вверх", 
     "url": "https://moosic.my.mail.ru/file/42932d576bc79cbd1e95ddfdb5dcdc9f.mp3",
     "duration": "4:02"},
    {"id": 2, "title": "Ну, где же вы, девчонки", "artist": "Руки Вверх",
     "url": "https://moosic.my.mail.ru/file/3597faf7437f781cdd3da897b98a3a4c.mp3",
     "duration": "4:38"},
    {"id": 3, "title": "Чужие губы", "artist": "Руки Вверх",
     "url": "https://moosic.my.mail.ru/file/ec5b764296d23bf91e75a0b3d49971fd.mp3",
     "duration": "4:01"},
    {"id": 4, "title": "18 Тебе уже", "artist": "Руки Вверх",
     "url": "https://moosic.my.mail.ru/file/ddda74f6bd7b1384bac69052c60f43c8.mp3",
     "duration": "4:02"},
    {"id": 5, "title": "Уходи", "artist": "Руки ВВерх",
     "url": "https://moosic.my.mail.ru/file/56a12a60f5a2202be0ed52c18f167581.mp3",
     "duration": "3:53"},
    {"id": 6, "title": "Крошка моя, я по тебе скучаю", "artist": "Руки Вверх",
     "url": "https://moosic.my.mail.ru/file/588746078840a1e57802f98061854877.mp3",
     "duration": "3:55"},
    {"id": 7, "title": "Алешка", "artist": "Руки Вверх",
     "url": "https://moosic.my.mail.ru/file/6b8443109468bb765b83cc032ad6cac6.mp3",
     "duration": "3:23"},
    {"id": 8, "title": "Sick and Tired", "artist": "Anastacia",
     "url": "https://moosic.my.mail.ru/file/6615b9b23989c1ecc32d5be6338ad39e.mp3",
     "duration": "3:30"},
    {"id": 9, "title": "Были Бы Крылья", "artist": "Merab Amzoevi",
     "url": "https://moosic.my.mail.ru/file/de48269eb6e0f6eb154a862f37ea94c4.mp3",
     "duration": "3:01"},
    {"id": 10, "title": "Голова", "artist": "Канги",
     "url": "https://moosic.my.mail.ru/file/603c65915f9962684f0476f6222aac34.mp3",
     "duration": "2:55"},
    {"id": 11, "title": "Не мешай", "artist": "RSAC",
     "url": "https://moosic.my.mail.ru/file/4d56cf120e06dfd9b09c5e86acacf7b6.mp3",
     "duration": "2:11"},
    {"id": 12, "title": "Прыгну со сколы", "artist": "Король и шут",
     "url": "https://moosic.my.mail.ru/file/3703247dbcec27869a477bc010cf564a.mp3",
     "duration": "3:10"},
    {"id": 13, "title": "Ели мясо мужики", "artist": "Король и шут",
     "url": "https://moosic.my.mail.ru/file/d1b4dbd7925c2d33fc9a923571d3c199.mp3",
     "duration": "2:55"},
    {"id": 14, "title": "Лесник", "artist": "Король и шут",
     "url": "https://moosic.my.mail.ru/file/f4b7315362aadd5b1584c07c9abd20c9.mp3",
     "duration": "2:50"},
    {"id": 15, "title": "Ворона", "artist": "Линда",
     "url": "https://moosic.my.mail.ru/file/27481114089fdcd8bd9522afd3015b2c.mp3",
     "duration": "3:46"},
    {"id": 16, "title": "Мой сон", "artist": "Буланова",
     "url": "https://moosic.my.mail.ru/file/ff931f4b69267943ba1d09fbae33b268.mp3",
     "duration": "4:30"},
    {"id": 17, "title": "Не плач", "artist": "Буланова",
     "url": "https://moosic.my.mail.ru/file/ab3a6d546dad22a354b5c85a3ec1a40c.mp3",
     "duration": "2:55"},
    {"id": 18, "title": "На заре", "artist": "Баста",
     "url": "https://moosic.my.mail.ru/file/26014f2ee17dc762a1dff2066032b083.mp3",
     "duration": "5:06"},
    {"id": 19, "title": "Я больше не напишу", "artist": "Тима Белорусских",
     "url": "https://moosic.my.mail.ru/file/14230aa4795bb4e8f9d4dc18b15eb04c.mp3",
     "duration": "3:11"},
    {"id": 20, "title": "Ночная Травма", "artist": "Хан Замай & Слава КПСС",
     "url": "https://moosic.my.mail.ru/file/fe6b406f03cfa54f9460c643d9272554.mp3",
     "duration": "3:11"}
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
def serve_manifest():
    # Ищем файл в той же папке, где лежит app.py
    return send_from_directory(app.root_path, 'manifest.json')

# ✅ ПРАВИЛЬНЫЙ МАРШРУТ ДЛЯ SERVICE WORKER
@app.route('/sw.js')
def serve_sw():
    # Ищем файл в той же папке, где лежит app.py
    return send_from_directory(app.root_path, 'sw.js')

if __name__ == '__main__':

    app.run(debug=True, host='0.0.0.0', port=5000)





