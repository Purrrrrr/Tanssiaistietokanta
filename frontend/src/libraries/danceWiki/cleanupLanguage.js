import {isTitlecase, titleCase} from './utils/titleCase'

const replacements = {
  mies: 'herra',
  miehet: 'herrat',
  miehen: 'herran',
  miesten: 'herrojen',
  miehien: 'herrojen',
  miestä: 'herraa',
  miehiä: 'herroja',
  miehessä: 'herrassa',
  miehissä: 'herroissa',
  miehestä: 'herrasta',
  miehistä: 'herroista',
  mieheen: 'herraan',
  miehiin: 'herroihin',
  miehellä: 'herralla',
  miehillä: 'herroilla',
  mieheltä: 'herralta',
  miehiltä: 'herroilta',
  miehelle: 'herralle',
  miehille: 'herroille',
  miehenä: 'herrana',
  miehinä: 'herroina',
  mieheksi: 'herraksi',
  miehiksi: 'herroiksi',
  miehettä: 'herratta',
  miehittä: 'herroitta',
  nainen: 'leidi',
  naiset: 'leidit',
  naisen: 'leidin',
  naisten: 'leidien',
  naisien: 'leidien',
  naista: 'leidiä',
  naisia: 'leidejä',
  naisessa: 'leidissä',
  naisissa: 'leideissä',
  naisesta: 'leidistä',
  naisista: 'leideistä',
  naiseen: 'leidiin',
  naisiin: 'leideihin',
  naisella: 'leidillä',
  naisilla: 'leideillä',
  naiselta: 'leidiltä',
  naisilta: 'leideiltä',
  naiselle: 'leidille',
  naisille: 'leideille',
  naisena: 'leidinä',
  naisina: 'leideinä',
  naiseksi: 'leidiksi',
  naisiksi: 'leideiksi',
  naisetta: 'leidittä',
  naisitta: 'leideittä',
  naisin: 'leideihin',
  'woman\'s': 'lady\'s',
  'women\'s': 'ladies\'',
  woman: 'lady',
  women: 'ladies',
  /* //Not sure about these
  man: 'lord',
  'man\'s': 'lord\'s',
  men: 'lord',
  'men\'s': 'lords\'',
  */
}

export function cleanupLanguage(text) {
  let ret = text
  for(const [replace, replacement] of Object.entries(replacements)) {
    ret = ret.replace(
      new RegExp('\\b'+replace+'\\b', 'ig'),
      word => isTitlecase(word) ? titleCase(replacement) : replacement
    )
  }
  return ret
}
