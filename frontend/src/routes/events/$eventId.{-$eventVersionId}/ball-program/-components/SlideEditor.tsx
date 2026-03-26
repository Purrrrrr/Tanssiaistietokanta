import {
  EventProgramSettings,
  Form,
  useEventProgramEditorForm,
} from 'components/event/EventProgramForm'
import { EventSlideProps } from 'components/event/EventSlide'
import { EventSlideEditor } from 'components/event/EventSlideEditor'

interface SlideEditorProps {
  slide: EventSlideProps
  eventId: string
  eventVersionId?: string
  eventProgram: EventProgramSettings
}

export function SlideEditor({ slide, eventId, eventVersionId, eventProgram }: SlideEditorProps) {
  const { formProps, state } = useEventProgramEditorForm(eventId, eventVersionId, eventProgram)

  return <div>
    <Form {...formProps}>
      <EventSlideEditor {...slide} eventProgram={eventProgram} syncStatus={state} />
    </Form>
  </div>
}
