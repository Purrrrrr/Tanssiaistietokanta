import { makeTranslator } from 'libraries/i18n'

const translations = {
  fi: {
    diagram: 'Kaavio',
    chosenObject: {
      zero: 'Valittu elementti',
      one: 'Valittu elementti',
      many: 'Valitut elementit',
    },
    undo: 'Kumoa',
    redo: 'Tee uudelleen',
    insertDiagram: 'Lisää kaavio',
    addShape: 'Lisää muoto',
    addRect: 'Lisää suorakulmio',
    addEllipse: 'Lisää ellipsi',
    addCircle: 'Lisää ympyrä',
    addTriangle: 'Lisää kolmio',
    addPentagon: 'Lisää viisikulmio',
    addHexagon: 'Lisää kuusikulmio',
    addStar: 'Lisää tähti',
    addArrow: 'Lisää nuoli',
    addText: 'Lisää teksti',
    copyToClipboard: 'Kopioi leikepöydälle',
    pasteFromClipboard: 'Liitä leikepöydältä',
    freeDraw: 'Piirrä',
    editPolygon: 'Muokkaa muotoa',
    bringForward: 'Tuo eteen',
    sendBackward: 'Lähetä taakse',
    fill: 'Täyttö',
    stroke: 'Reunaviiva',
    strokeWidth: 'Reunan leveys',
    duplicate: 'Kopioi',
    deleteShape: 'Poista muoto',
    removeDiagram: 'Poista kaavio',
    resize: 'Muuta kokoa',
  },
}

export const { useT: useFabricT, useTranslation: useFabricTranslation } = makeTranslator(translations)
