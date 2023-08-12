import React from 'react'

import {formFor, MarkdownEditor} from 'libraries/forms'
import {DanceEditorContainer} from 'components/DanceEditor'

import {Dance} from 'types'

import {SlideContent} from './useBallProgram'

interface SlideEditorProps {
  slide: SlideContent
}
export function SlideEditor({slide}: SlideEditorProps) {
  return <div>
    {slide.slideContent?.type === 'dance' &&
      <DanceEditor dance={slide.slideContent.value} />
    }
    {slide.slideContent?.type !== 'dance' &&
      <p>No editor yet, sorry!</p>
    }
  </div>
}

const {
  Field,
  Input,
} = formFor<Dance>()
function DanceEditor({dance}: {dance: Dance}) {
  return <DanceEditorContainer dance={dance}>
    <Input label="Nimi" path="name" />
    <Field label="Kuvaus ja lyhyt ohje" path="description" component={MarkdownEditor} componentProps={{noPreview: true}}/>
  </DanceEditorContainer>

}
