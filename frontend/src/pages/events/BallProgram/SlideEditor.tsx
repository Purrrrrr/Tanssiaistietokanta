import React from 'react'

import {DanceEditor} from 'components/DanceEditor'

import {SlideContent} from './useBallProgram'

interface SlideEditorProps {
  slide: SlideContent
}
export function SlideEditor({slide}: SlideEditorProps) {
  return <div>
    {slide.slideContent?.type === 'dance' &&
      <DanceEditor dance={slide.slideContent.value} />
    }
  </div>
}
