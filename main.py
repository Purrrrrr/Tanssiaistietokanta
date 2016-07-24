#!/usr/bin/python3

from sys import argv
from audiofiles import getAudioDatabase
from playlists import Playlist, getPlaylistFiles
from bottle import route, run, request
from os.path import basename

import csv

if len(argv) < 2:
  print("Usage: "+argv[0]+" path/to/audio/directory [path/to/playlist]")
  exit()
path = argv[1];

playlistPaths = argv[2:]
if not playlistPaths:
    playlistPaths = getPlaylistFiles(path)

@route('/reload')
def reloadDatabase():
  global database, playlists
  try:
    database = getAudioDatabase(path)
    playlists = dict([(basename(f), Playlist.getPlaylist(f)) for f in playlistPaths])
  except ValueError as e:
    print(e)
    exit()

@route('/track')
def index():
  return dict([(id, audioFile.toDict()) for (id, audioFile) in database.items()])

@route('/track/<id>', method = 'POST')
def save(id):
  inputData = request.json
  audioFile = database[int(id)]
  
  if "name" in inputData:
    audioFile.name = inputData["name"]
  if "info" in inputData:
    audioFile.info = inputData["info"]
  audioFile.update()

  return audioFile.toDict()

def findTrackDict(filename):
    candidates = list(filter(lambda item: item.fileName == filename ,database.values()))
    if candidates:
        return candidates[0].toDict()

    return {id: None, name: filename, filename: filename, info: {}}

def playlistToDict(playlist):
    return [{"name": part.name, "tracks": list(map(findTrackDict, part.tracks))} for part in playlist.parts]


@route('/playlist')
def index():
  return dict([(id, playlistToDict(playlist)) for (id, playlist) in playlists.items()])

reloadDatabase()

run(host='localhost', port=8081)

