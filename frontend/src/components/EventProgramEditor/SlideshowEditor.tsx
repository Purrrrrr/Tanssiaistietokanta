import {Card, Flex} from 'libraries/ui'
import {EventSlide} from 'components/EventSlide/EventSlide'
import {useEventSlides} from 'components/EventSlide/useEventSlides'
import {SlideContainer} from 'components/Slide'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {useT} from 'i18n'

import {EventProgramSettings} from './types'

import { Field } from './components'
import { EventSlideEditor } from './components/EventSlideEditor'

import './EventProgramEditor.sass'
import '../Slide/slideStyles.scss'


export function SlideshowEditor({ value }: {value: EventProgramSettings}) {
  const t = useT('components.eventProgramEditor')
  const slides = useEventSlides(value)

  return <section className="eventProgramEditor">
    <div className="main-toolbar">
      <Field label="" inline path="slideStyleId" component={SlideStyleSelector} componentProps={{text: t('fields.eventDefaultStyle')}} />
    </div>
    {slides.map(slide =>
      <Card key={slide.id}>
        <Flex wrap spaced>
          <div className="flex-fill">
            <EventSlideEditor {...slide} eventProgram={value} />
          </div>
          <SlideContainer size={500}><EventSlide {...slide} eventProgram={value} /></SlideContainer>
        </Flex>
      </Card>
    )}
  </section>
}
