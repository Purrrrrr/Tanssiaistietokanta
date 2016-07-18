#!/usr/bin/python3

from sys import argv
from audiofiles import getAudioDatabase
from bottle import route, run, request

if len(argv) != 2:
  print("Usage: "+argv[0]+" path/to/audio/directory")
  exit()
path = argv[1];

try:
  database = getAudioDatabase(path)
except ValueError as e:
  print(e)
  exit()

@route('/')
def index():
  return dict([(id, audioFile.toDict()) for (id, audioFile) in database.items()])

@route('/<id>', method = 'POST')
def save(id):
  return request.json

run(host='localhost', port=8081)

