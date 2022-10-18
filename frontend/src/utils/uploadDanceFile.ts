import {Dance} from 'services/dances'

export async function uploadDanceFile() {
  const file = await requestUserFile()
  if (!file) return

  const dance : Dance = {
    name: stripExtension(file.name)
  }
  
  try {
    Object.assign(dance, await decodeAudioData(file))
  } catch(_) { /* Nothing to do */ }

  return dance
}

function requestUserFile(types?: string) : Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    if (types) input.accept = types
    input.addEventListener('change', (e : Event)  => {
      const files = (e.target as HTMLInputElement).files
      
      if (!files || !files[0]) {
        reject()
      } else {
        resolve(files[0])
      }
    })
    input.click()
  })
}

function stripExtension(fileName : string) {
  return fileName.replace(/\.[^.]*$/, '')
}

async function decodeAudioData(file : File) : Promise<{duration?: number}> {
  const buffer = await readFile(file)
  return new Promise(function(resolve, reject) {
    new AudioContext().decodeAudioData(buffer, resolve, reject)
  })
}

function readFile(file : File) : Promise<ArrayBuffer> {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader()
    reader.onload = (_) => {
      const {result} = reader
      if (!result || typeof(result) == 'string') reject()
      else resolve(result)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
