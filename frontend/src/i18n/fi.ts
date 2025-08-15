export const fi = {
  app: {
    title: 'Tanssiaistietokanta',
    copyright: 'Tanssitietokannan tekijät',
    licenceLink: 'https://raw.githubusercontent.com/Purrrrrr/Tanssiaistietokanta/main/frontend/LICENSE',
  },
  navigation: {
    dances: 'Tanssit',
    breadcrumbs: 'Murupolku',
    moveToContent: 'Siirry pääsisältöön',
  },
  breadcrumbs: {
    app: 'Tanssiaistietokanta',
    dances: 'Tanssit',
    eventProgram: 'Tanssiaisohjelma',
  },
  validationMessage: {
    default: 'Tarkista arvo',
    required: 'Täytä kenttä',
    requiredList: 'Kentän täytyy sisältää ainakin yksi arvo',
    /* eslint-disable no-template-curly-in-string */
    minLength: 'Syötä ainakin ${min} merkkiä',
    maxLength: 'Syötä korkeintaan ${max} merkkiä',
    min: 'Pitää olla ainakin ${min}',
    max: 'Saa olla korkeintaan ${max}',
    /* eslint-enable no-template-curly-in-string */
  },
  dateFormat: 'dd.MM.yyyy',
  dateTimeFormat: 'dd.MM.yyyy HH:mm',
  domain: {
    dance: {
      name: 'Nimi',
      description: 'Kuvaus ja lyhyt ohje',
      remarks: 'Huomautuksia',
      duration: 'Kesto',
      prelude: 'Alkusoitto',
      formation: 'Tanssikuvio',
      source: 'Lähde',
      sourceInfo: '(esim. Playford, 1709)',
      category: 'Kategoria',
      instructions: 'Pidemmät tanssiohjeet printtiin',
      slideStyleId: 'Tanssiaisten diatyyli',
      wikipageName: 'Tanssiwikin sivun nimi'
    },
    slideStyles: {
      default: 'Valkoinen',
      dark: 'Tumma',
      flowerBig: 'Kukka iso __number__',
      flowerFramed: 'Kukka reunus __number__',
    },
  },
  components: {
    slide: {
      afterThis: 'Tämän jälkeen',
    },
    loginForm: {
      login: 'Kirjaudu sisään',
      logout: 'Kirjaudu ulos',
    },
    deleteButton: {
      cancel: 'Peruuta',
      delete: 'Poista',
    },
    loadingState: {
      connectionError: 'Yhteydenotto palvelimeen ei onnistu',
      errorMessage: 'Tietojen lataaminen epäonnistui',
      tryAgain: 'Yritä uudelleen',
    },
    dance: {
      createDanceButton: {
        createDance: 'Uusi tanssi',
        untitledDance: 'Nimetön tanssi #__number__',
        danceCreated: 'Tanssi __name__ luotu',
        uploadDance: 'Tuo tanssi tiedostosta',
      },
    },
    danceChooser: {
      searchDance: 'Etsi tanssia...',
      emptyDancePlaceholder: 'Tansseja ei löytynyt',
      createDance: 'Luo uusi tanssi',
      categories: {
        missingFromWorkshops: 'Puuttuvat työpajoissa opetetut tanssit',
        dances: 'Tanssit',
        other: 'Muut',
      },
    },
    wikipageSelector: {
      searchPage: 'Etsi sivua...',
      suggestions: 'Ehdotukset',
      wikipage: 'Tanssiohjeet',
      spam: 'Roskapostisivut',
    },
    danceCategoryChooser: {
      anyCategory: 'Kaikki kategoriat',
      noCategory: 'Ei kategoriaa',
    },
    danceEditor: {
      linkToThisDance: 'Linkki tähän tanssiin',
      deleteDance: 'Poista tanssi',
      deleteConfirmation: 'Haluatko varmasti poistaa tämän tanssin?',
      danceUsedInEvents: {
        one: 'Yksi tanssitapahtuma',
        many: '__count__ tanssitapahtumaa',
      },
      danceUsedInEventsAndWiki: {
        zero: 'Wikisivu, Ei tanssitapahtumia',
        one: 'Yksi tanssitapahtuma ja wikisivu',
        many: '__count__ tanssitapahtumaa ja wikisivu',
      },
      danceEvents: 'Tanssitapahtumat',
      copyFromDancewiki: 'Kopioi ohjeet tanssiwikistä',
      suggestions: 'Ehdotuksia',
      editInstructions: 'Muokkaa tanssiohjeita',
    },
    danceWikiPreview: {
      danceInDanceWiki: 'Tanssi tanssiwikissä',
      danceFetched: 'Sivun tiedot ja sisältö haettu __date__',
      openInstructions: 'Avaa wikin ohje',
      fetchInstructions: 'Päivitä tiedot',
      fetching: 'Haetaan tietoja...',
    },
    workshopEditor: {
      dances: 'Tanssit',
      addDance: 'Lisää tanssi: ',
      noDances: 'Tanssilista on tyhjä.',
      name: 'Nimi',
      required: '(pakollinen)',
      abbreviation: 'Lyhennemerkintä',
      abbreviationHelp: 'Lyhennemerkintä näytetään settilistassa työpajassa opetettujen tanssien kohdalla',
      abbreviationTaken: 'Lyhenne __abbreviation__ on jo käytössä toisessa pajassa. Tässä tapahtumassa ovat jo käytössä seuraavat lyhenteet: __abbreviations',
      description: 'Työpajan kuvaus',
      teachers: 'Opettaja(t)',
      instanceSpecificDances: 'Joka opetuskerralla on omat tanssinsa',
      instances: 'Opetuskerrat',
      addInstance: 'Lisää opetuskerta',
      instanceAbbreviation: 'Kerran lyhenne',
      instanceAbbreviationHelp: 'Lyhennemerkintä näytetään työpajan lyhennemerkinnän rinnalla niiden tanssien kohdalla, jotka on opetettu ainoastaan tällä opetuskerralla.',
      instanceAbbreviationExample: 'Tämä lyhenne näytetään muodossa __abbreviation__',
      dateTime: 'Ajankohta',
      duration: 'Kesto minuuteissa'
    },
    eventProgramEditor: {
      fields: {
        eventProgram: {
          name: 'Ohjelman nimi',
          description: 'Ohjelman kuvaus',
          duration: 'Ohjelman kesto',
          showInLists: 'Näytä ohjelma tanssilistoissa',
        },
        intervalMusic: {
          useDefaultTexts: 'Käytä oletusotsikkoa ja kuvausta',
          name: 'Otsikko diashowssa',
          description: 'Tarkempi kuvaus',
          showInLists: 'Näytä taukomusiikki tanssilistoissa',
        },
        danceSetName: 'Tanssisetin nimi',
        eventDefaultStyle: 'Ohjelman oletustyyli',
        intervalMusicAtEndOfSet: 'Taukomusiikki setin lopussa',
        intervalMusicDuration: 'Taukomusiikin kesto',
        pauseDuration: 'Tanssien välinen tauko',
        programTitle: 'Ohjelman otsikko',
        style: 'Tyyli',
      },
      slides: {
        moveToSlide: 'Siirry diaan',
      },
      danceCount: {
        zero: '-',
        one: '1 tanssi',
        many: '__count__ tanssia',
      },
      requestedDanceCount: {
        zero: '-',
        one: '1 toivetanssi',
        many: '__count__ toivetanssia',
      },
      otherProgramCount: {
        zero: '-',
        one: '1 muu ohjelma',
        many: '__count__ muuta ohjelmaa',
      },
      buttons: {
        addDance: 'Lisää tanssi',
        addDanceSet: 'Lisää tanssisetti',
        addInfo: 'Lisää muuta ohjelmaa',
        addIntroductoryInfo: 'Lisää alkutiedote',
        editDanceSetName: 'Muokkaa tanssisetin nimeä',
        cancel: 'Peruuta',
        removeDanceSet: 'Poista setti',
        remove: 'Poista',
      },
      columnTitles: {
        name: 'Nimi',
        duration: 'Kesto',
      },
      titles: {
        introductoryInformation: 'Alkutiedotukset',
        customIntervalMusicTexts: 'Mukautetut kuvaukset',
        defaultIntervalMusicTexts: 'Taukomusiikin oletuskuvaukset',
      },
      placeholderNames: {
        newProgramItem: 'Uusi ohjelmanumero',
        danceSet: 'Setti __number__',
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
      missingDanceInstructionsWarning: {
        programIsMissingInstructions: 'Ohjelmasta puuttuu tanssiohjeita',
        dancesWithoutInstructions: {
          one: 'Diashowssa on yksi tanssi, jolta puuttuu tanssiohjeet.',
          many: 'Diashowssa on __count__ tanssia, joilta puuttuu tanssiohjeet.',
        },
        clickLinksToOpenSlide: 'Klikkaa linkkejä muokataksesi ohjeita.',
        inSet: 'setissä',
        teachedInSet: 'opetettu setissä',
        missingDancesCount: {
          one: 'puuttuva tanssiohje',
          many: 'puuttuvaa tanssiohjetta',
        }
      },
      missingDancesWarning: {
        title: {
          one: 'Ohjelmasta puuttuu yksi työpajoissa opetettu tanssi.',
          many: 'Ohjelmasta puuttuu __count__ työpajoissa opetettua tanssia.',
        }
      },
      duplicateDancesWarning: {
        title: {
          one: 'Seuraava tanssi esiintyy ohjelmassa useamman kerran',
          many: 'Seuraavat tanssit esiintyvät ohjelmassa useamman kerran',
        },
        inDanceSets: {
          one: 'setissä',
          many: 'seteissä'
        }
      },
      danceCategoryStats: {
        title: 'Tanssien määrät tanssiaisissa kategorioittain:',
      },
    },
    supportedBrowserWarning: {
      unsupportedBrowser: 'Selaimesi ei ole tuettu',
      continueAnyWay: 'Jatka sivustolle',
      downloadBetterBrowser: 'Lataa uusin Firefox',
      siteMayNotWork: 'Selaimesi ei tue kaikkia tämän sivuston käyttämiä ominaisuuksia. Jos jatkat, sivusto ei välttämättä toimi tarkoituksenmukaisesti.',
      possibleSupportedBrowsers: 'Tanssitietokanta on kehitetty ja testattu enimmäkseen Firefoxilla, mutta se tukee ainakin seuraavien selaimien uusimpia versioita:'
    },
  },
  pages: {
    events: {
      eventList: {
        pageTitle: 'Tanssiaistietokanta',
        weHaveXEvents: {
          zero: 'Kannassa ei ole tällä hetkellä yhtäkään tanssitapahtumaa.',
          one: 'Kannassa on tällä hetkellä yksi tanssitapahtuma.',
          many: 'Kannassa on tällä hetkellä __count__ tanssitapahtumaa.',
        },
        youcanEditDancesIn: 'Voit muokata tanssitapahtumien tansseja',
        danceDatabaseLinkName: 'tanssitietokannasta',
        danceEvents: 'Tanssitapahtumat tietokannassa',
        eventDeleteConfirmation: 'Haluatko varmasti poistaa tapahtuman __eventName__?',
        createEvent: 'Uusi tapahtuma',
      },
      createEvent: {
        newEventBreadcrumb: 'Uusi tapahtuma',
        newEvent: 'Luo uusi tapahtuma',
        create: 'Luo',
        name: 'Nimi',
        eventDate: 'Tapahtuman ajankohta',
        beginDate: 'Alkaa',
        endDate: 'Loppuu',
      },
      eventPage: {
        ballProgram: 'Tanssiaisohjelma',
        noProgram: 'Ei ohjelmaa',
        eventDetails: 'Tapahtuman tiedot',
        eventName: 'Tapahtuman nimi',
        editProgram: 'Muokkaa ohjelmaa',
        viewProgram: 'Ohjelman tiedot',
        addProgram: 'Luo ohjelma',
        workshops: 'Työpajat',
        printBallDanceList: 'Tulosta settilista',
        ballProgramSlideshow: 'Tanssiaisten diashow',
        dances: 'Tanssit',
        openBasicDetailsEditor: 'Muokkaa tapahtuman tietoja',
        openEditor: 'Muokkaa',
        closeEditor: 'Sulje muokkaus',
        createWorkshop: 'Uusi työpaja',
        newWorkshop: 'Uusi työpaja',
        danceCheatlist: 'Osaan tanssin -lunttilappu',
        danceInstructions: 'Työpajojen ohjelma ja tanssiohjeet',
        requestedDance: {
          one: 'Toivetanssi',
          many: '__count__ toivetanssia'
        },
        eventDate: 'Tapahtuman ajankohta',
        ballDateTime: 'Tanssiaisten ajankohta',
      },
      eventProgramPage: {
        pageTitle: 'Tanssiaisohjelma',
        backToEvent: 'Takaisin tapahtuman tietoihin',
        loginRequired: 'Sinun täytyy olla kirjautunut käyttääksesi tätä sivua',
        tabs: {
          main: 'Tanssiohjelma',
          slides: 'Diashow',
          missingInstructions: 'Puuttuvat tanssiohjeet',
        }
      },
      danceCheatlist: {
        helpText: 'Rastita tähän, jos osaat tanssin. Näin ei tanssiaisissa tarvitse miettiä, mikä tanssi on kyseessä.',
        rows: 'Rivien määrä',
        cols: 'Sarakkeiden määrä',
        landscape: 'Tulosta vaakasuunnassa',
        nrOfCopies: {
          one: '1 kopio per sivu',
          many: '__count__ kopiota per sivu',
        },
        showHelpText: 'Näytä luntin ohjeteksti',
        print: 'Tulosta',
        noDances: 'Ei tansseja',
        iCanDanceThis: 'Osaan tanssin',
        danceName: 'Nimi',
      },
      danceList: {
        style: {
          'default': 'Oletus',
          'three-columns': 'Rinnakkaiset setit',
          large: 'Yksi setti per arkki',
        },
        showLinks: 'Linkit tanssiwikiin',
        print: 'Tulosta',
        emptyLinesAreRequestedDances: 'Tyhjät rivit ovat toivetansseja.',
        workshopNameIsInParenthesis: 'Suluissa opetussetti',
      },
      danceInstructions: {
        clickInstructionsToEdit: 'Klikkaa ohjetta muokataksesi sitä, voit myös hakea tietoja tanssiwikistä klikkaamalla nappeja, jotka avautuvat kun tuot hiiren tanssin päälle. Kun ohjeet ovat mieleisesi, voit joko tulostaa tämän sivun tai valita ohjetekstit ja kopioida ne haluamaasi tekstinkäsittelyohjelmaan.',
        defaultStylingDescription: 'Pitkissä ohjeissa on oletustyyli, jossa ensimmäinen kappale on kursivoitu. Tämän tarkoituksena on eritellä tanssin ja tanssikuvion lyhyt kuvaus lopusta ohjeesta ilman tilaa vievää otsikointia.',
        selectAndCopy: 'Kopioi ohjeet leikepöydälle',
        instructionsCopied: 'Ohjeet kopioitu',
        print: 'Tulosta',
        showWorkshops: 'Näytä työpajojen ja tanssiaisten kuvaukset',
        showDances: 'Näytä tanssiohjeet',
        hilightEmpty: 'Korosta tanssit ilman ohjeita',
        showShortInstructions: 'Näytä lyhyet ohjeet',
        workshops: 'Työpajat ja tanssiaiset',
        ball: 'Tanssiaiset',
        dances: 'Tanssit',
        danceInstructions: 'Tanssiohjeet',
      },
      ballProgram: {
        teachedInSet: 'Opetettu setissä',
        requestedDance: 'Toivetanssi',
        intervalMusic: 'Taukomusiikkia',
        linkToCompleteDance: 'Avaa tanssi tanssitietokannassa',
        slideProperties: 'Dian tiedot',
        currentItemAlwaysShownInLists: 'Huomaathan, että ollessaan tämänhetkinen dia näkyy tämä ohjelma settilistassa riippumatta näkyvyysasetuksesta.',
        intervalMusicTitle: 'Taukomusiikki',
        infoTitle: 'Ohjelmanumero',
        danceSetTitle: 'Tanssisetti',
      },
    },
    dances: {
      danceList: {
        pageTitle: 'Tanssit',
        view: 'Näkymä',
        viewMode: {
          tight: 'Tiivis',
          extended: 'Laaja',
        },
        noCategory: 'Ei kategoriaa',
        showingNDances: {
          one: 'Näytetään 1 tanssi',
          many: 'Näytetään __count__ tanssia',
        }
      },
      dancePage: {
        backToDanceList: 'Takaisin tanssilistaan',
        backToEventProgram: 'Takaisin ohjelman tietoihin',
      },
    },
  },
  versioning: {
    versionHistory: 'Muokkaushistoria',
    version: 'Versio __version__',
    now: 'Nyt',
    newestVersion: 'Tämänhetkinen versio',
    next: 'Seuraava',
    previous: 'Edellinen',
  },
  common: {
    emptySearch: 'Tyhjennä haku',
    search: 'Hae...',
    delete: 'Poista',
    edit: 'Muokkaa',
    close: 'Sulje',
    closeEditor: 'Sulje muokkaus',
    cancel: 'Peruuta',
    save: 'Tallenna',
    move: 'Siirrä',
    operationFailed: 'Tietojen tallennus epäonnistui :(',
    version: 'versio __version__',
  },
}
