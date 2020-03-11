from os import listdir
from os.path import isfile, isdir, join, splitext
import mutagen
import subprocess
import sqlite3 

def extension(path):
    return splitext(path)[-1]

def getAudioDatabase(path):
  if not isdir(path):
    raise ValueError("Please supply a directory to scan for audio files")

  files = [f for f in listdir(path) 
          if isfile(join(path, f)) and extension(f) not in (".m3u",".sqlite3", ".aup")]
  audioFiles = list(filter(None, [AudioFile.fromFile(path, f) for f in files]))
    
  if len(audioFiles) == 0:
    raise ValueError("Please supply a directory with audio files")

  database = sqlite3.connect(join(path, 'data.sqlite3'), isolation_level=None)
  createTables(database)

  for f in audioFiles:
    f.initRow(database)

  return dict([(f.id, f) for f in audioFiles])

def getAudioLength(filePath):
  data = mutagen.File(filePath)
  if data:
    return data.info.length
  
  cmd = ['ffprobe',  '-i', filePath, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0']
  process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  stdout, stderr = process.communicate()
  
  try:
    return float(stdout.decode('utf8').strip())
  except ValueError:
    print("Not an audio file: "+filePath)
    return None

class AudioFile:
  @staticmethod
  def fromFile(path, fileName):
    #print(fileName);
    length = getAudioLength(join(path, fileName))
    if not length: 
      return None
    return AudioFile(fileName, length)

  def __init__(self, fileName, length):
    self.id = None
    self.name = splitext(fileName)[0]
    self.fileName = fileName
    self.length = length
    self.info = {}
  
  def initRow(self, db):
    self.db = db
    rows = db.execute(
        """SELECT id, filename, name FROM audio WHERE filename = ?""", 
        (self.fileName,)
        ).fetchall()
    if len(rows) == 0:
      self.insert()
    else:
      row = rows[0]
      (self.id, self.fileName, self.name) = row
      self._fetchInfo()
      #print(self)

  def _fetchInfo(self):
    rows = self.db.execute(
        """SELECT key, value FROM audio_info WHERE audio_id = ?""", 
        (self.id,)
        ).fetchall()
    self.info = dict(rows)

  def insert(self):
    self.id = self.db.execute(
        "INSERT INTO audio(fileName, name, length) VALUES(?, ?, ?)", 
        (self.fileName, self.name, self.length)).lastrowid

  def update(self):
    if self.id is None:
      raise ValueError("Trying to update a file without id. What are you doing boy?")
    self.db.execute(
        """UPDATE audio SET name = ? WHERE id = ?""",
        (self.name, self.id)
        )
    self._saveInfo()

  def _saveInfo(self):
    self.db.execute( """DELETE FROM audio_info WHERE audio_id = ?""", (self.id,))
    for (key, value) in self.info.items():
      self.db.execute(
          "INSERT INTO audio_info(audio_id, key, value) VALUES(?, ?, ?)", 
          (self.id, key, value))

  def toDict(self):
    items = dict(self.__dict__)
    del items["db"]
    return items

  def __repr__(self):
    items = ("%s = %r" % (k, v) for k, v in self.__dict__.items())
    return "<%s: {%s}>" % (self.__class__.__name__, ', '.join(items))

def createTables(con):
  cur = con.cursor()
  cur.executescript("""
CREATE TABLE IF NOT EXISTS audio(
  id INTEGER PRIMARY KEY,
  filename TEXT,
  name TEXT,
  length INTEGER
);
CREATE TABLE IF NOT EXISTS audio_info (
  audio_id INTEGER,
  key TEXT,
  value TEXT
);
      """)
