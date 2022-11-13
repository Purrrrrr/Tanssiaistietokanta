import {makeTranslate} from 'utils/translate'

export default makeTranslate({
  fields: {
    eventProgram: {
      name: 'Ohjelman nimi',
      description: 'Ohjelman kuvaus',
      showInLists: 'Näytä ohjelma tanssilistoissa',
    },
    moveDanceSet: {
      moveDanceSet: 'Siirrä',
      afterSet: 'Setin "%(name)s" jälkeen',
      beforeSet: 'Ennen settiä "%(name)s"',
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
    save: 'Tallenna muutokset',
  },
  columnTitles: {
    type: 'Tyyppi',
    name: 'Nimi',
    actions: 'Toiminnot',
    duration: 'Kesto',
  },
  titles: {
    introductoryInformation: 'Alkutiedotukset',
  },
  placeholderNames: {
    newProgramItem: 'Uusi ohjelmanumero',
    danceSet: 'Setti %(number)s',
  },
  programTypes: {
    Dance: 'Tanssi',
    RequestedDance: 'Toivetanssi',
    EventProgram: 'Muu ohjelma',
    intervalMusic: 'Taukomusiikki',
  },
  duration: {
    pausesIncluded: '(taukoineen)',
    dances: '(tanssit)',
  },
  programListIsEmpty: 'Ei ohjelmaa',
  danceProgramIsEmpty: 'Ei tanssiohjelmaa.',
})
