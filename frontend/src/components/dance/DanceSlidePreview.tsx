import { Dance } from 'types'

import { DocumentViewer } from 'libraries/lexical/DocumentViewer'
import { Slide, SlideContainer } from 'components/Slide'

const fakeDances = [
  'La Petite Catastrophe',
  'Madame Figglebottom’s Measure',
  'Il Ballo del Second Breakfast',
  'The Northumberland Confusion',
  'Branle des Incorrectes',
  'Bassa Fortuna e Biscotti',
]

export function DanceSlidePreview({ dance }: { dance: Dance }) {
  return <SlideContainer size="100%">
    <Slide
      id="dance"
      title={dance.name}
      next={{ id: 'next', title: fakeDances[0] }}
      navigation={{ title: 'Setti 9', items: [{ id: 'dance', title: dance.name }, ...fakeDances.map((name, i) => ({ id: String(i), title: name }))] }}
    >
      <DocumentViewer document={dance.description} />
    </Slide>
  </SlideContainer>
}
