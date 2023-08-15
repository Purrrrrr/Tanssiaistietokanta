import {makeTranslate} from 'utils/translate'

export default makeTranslate({
  fields: {
    eventProgram: {
      name: 'Ohjelman nimi',
      description: 'Ohjelman kuvaus',
      showInLists: 'Näytä ohjelma tanssilistoissa',
    },
    intervalMusic: {
      useDefaultTexts: 'Käytä oletusotsikkoa ja kuvausta',
      name: 'Otsikko diashowssa',
      description: 'Tarkempi kuvaus',
    },
    danceSetName: 'Tanssisetin nimi',
    eventDefaultStyle: 'Ohjelman oletustyyli',
    intervalMusicAtEndOfSet: 'Taukomusiikki setin lopussa',
    intervalMusicDuration: 'Taukomusiikin kesto',
    moveItemToSection: 'Siirrä settiin',
    pauseDuration: 'Tanssien välinen tauko',
    programTitle: 'Tanssiaisohjelman otsikko',
    style: 'Tyyli',
    titleStyle: 'Otsikon tyyli',
  },
  buttons: {
    addDance: 'Lisää tanssi',
    addDanceSet: 'Lisää tanssisetti',
    addInfo: 'Lisää muuta ohjelmaa',
    addIntroductoryInfo: 'Lisää alkutiedote',
    cancel: 'Peruuta',
    removeDanceSet: 'Poista setti',
    remove: 'Poista',
    editProgram: 'Ohjelman tiedot',
    editIntervalMusic: 'Taukomusiikin kuvaus',
    editDance: 'Tanssin tiedot',
    save: 'Tallenna muutokset',
  },
  columnTitles: {
    name: 'Nimi',
    actions: 'Toiminnot',
    duration: 'Kesto',
  },
  titles: {
    introductoryInformation: 'Alkutiedotukset',
    customIntervalMusicTexts: 'Mukautetut kuvaukset',
    defaultIntervalMusicTexts: 'Taukomusiikin oletuskuvaukset',
  },
  placeholderNames: {
    newProgramItem: 'Uusi ohjelmanumero',
    danceSet: 'Setti %(number)s',
  },
  programTypes: {
    Dance: 'Tanssi',
    RequestedDance: 'Toivetanssi',
    EventProgram: 'Muu ohjelma',
    IntervalMusic: 'Taukomusiikki',
  },
  dance: 'Tanssi',
  duration: {
    pausesIncluded: '(taukoineen)',
    dances: '(tanssit)',
  },
  programListIsEmpty: 'Ei ohjelmaa',
  danceProgramIsEmpty: 'Ei tanssiohjelmaa.',
})
