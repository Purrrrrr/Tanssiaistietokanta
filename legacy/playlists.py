from os.path import dirname
from itertools import takewhile

from os.path import splitext, join, isfile
from os import listdir

def getPlaylistFiles(path):
    return [join(path, f) for f in listdir(path) 
            if isfile(join(path, f)) and splitext(f)[-1] == ".m3u"]

class Playlist:
    
    def __init__(self, parts):
        self.parts = parts
    
    @staticmethod
    def getPlaylist(filePath):
        #cwd = dirname(filePath)
        parts = []

        with open(filePath) as f:
            lines = f.readlines()
        lines = [line if line[-1] != "\n" else line[:-1] for line in lines]

        part = PlaylistPart()
        while len(lines) > 0:
            tracks = list(takewhile(lambda line: line[0] != "#", lines))
            
            lines = lines[len(tracks):]

            if len(tracks) > 0:
                part.tracks = tracks
                parts.append(part)
            if len(lines) > 0:
                nextPartName = lines.pop(0)[1:]
                part = PlaylistPart(nextPartName)
        if len(parts) == 0:
            return None
        return Playlist(parts)

class PlaylistPart:

    def __init__(self, partname=None):
        self.name = partname
        self.tracks = []
