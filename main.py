#!/usr/bin/python3

from sys import argv
from audiofiles import getAudioDatabase
from bottle import route, run, request

if len(argv) != 2:
  print("Usage: "+argv[0]+" path/to/audio/directory")
  exit()
path = argv[1];

@route('/reload')
def reloadDatabase():
  global database
  try:
    database = getAudioDatabase(path)
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

reloadDatabase()
run(host='localhost', port=8081)

