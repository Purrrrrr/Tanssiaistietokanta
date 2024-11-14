import {
  EventProgramSettings,
  Form,
  useEventProgramEditorForm,
} from 'components/EventProgramEditor/components'
import { EventSlideEditor } from 'components/EventProgramEditor/components/EventSlideEditor'
import { EventSlideProps } from 'components/EventSlide/types'

interface SlideEditorProps {
  slide: EventSlideProps
  eventId: string
  eventVersionId?: string
  eventProgram: EventProgramSettings
}

export function SlideEditor({slide, eventId, eventVersionId, eventProgram}: SlideEditorProps) {
  const {formProps, state} = useEventProgramEditorForm(eventId, eventVersionId, eventProgram)

  return <div>
    <Form {...formProps}>
      <EventSlideEditor {...slide} eventProgram={eventProgram} syncStatus={state} />
    </Form>
  </div>
}
