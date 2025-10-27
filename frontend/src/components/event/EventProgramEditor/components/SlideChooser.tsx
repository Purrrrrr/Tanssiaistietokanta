import classNames from 'classnames'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs'
import { FormGroup } from 'libraries/ui'
import { EventSlideProps } from 'components/event/EventSlide'
import { useTranslation } from 'i18n'

interface SlideChooserProps {
  slides: EventSlideProps[]
  currentSlide: EventSlideProps
  onChoose: (slide: string) => unknown
}

export function SlideChooser({ currentSlide, slides, onChoose }: SlideChooserProps) {
  const { parent } = currentSlide

  return <FormGroup
    className="md:min-w-100"
    label={useTranslation('components.eventProgramEditor.slides.moveToSlide')}
    labelStyle="beside"
    labelFor="slidechooser"
  >
    <AutocompleteInput
      emptyInputByDefault
      id="slidechooser"
      value={currentSlide}
      items={slides}
      placeholder={parent ? `${parent.title} / ${currentSlide.title}` : currentSlide.title}
      itemToString={slide => slide.title}
      onChange={slide => onChoose(slide.id)}
      itemRenderer={slide => <div className={classNames(
        'flex items-center gap-2',
        slide.parent !== undefined
          ? 'ps-4'
          : 'font-bold',
      )}>
        {slide.title}
      </div>}
    />
  </FormGroup>
}
