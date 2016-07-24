#!/usr/bin/python3

from sys import argv
from audiofiles import getAudioDatabase

if len(argv) < 2:
  print("Usage: "+argv[0]+" path/to/audio/directory [path/to/playlist]")
  exit()
path = argv[1];
database = getAudioDatabase(path)

import re
for track in database.values():
    found = re.search('([^(]*?) *(\(.+\))+', track.name)
    if found:
        track.name = found.group(1)
        if ("remarks" not in track.info):
            track.info["remarks"] = ""
        track.info["remarks"] += " "+found.group(2)
        track.update()
        print("Updated "+track.name)
