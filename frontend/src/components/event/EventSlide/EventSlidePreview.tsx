import { EventSlideProps, WithEventProgram } from './types'

export function EventSlidePreview(props: WithEventProgram<EventSlideProps>) {
  const style = getSlideStyle(props) ?? 'default'

  return <div className={`slide slide-style-${style}`}>
    <h1 className="slide-title">{props.title}</h1>
  </div>
}

function getSlideStyle(props: WithEventProgram<EventSlideProps>) {
  const { eventProgram, eventProgram: { introductions, danceSets, slideStyleId: defaultSlideStyleId } } = props
  switch(props.type) {
    case 'title':
      return introductions.titleSlideStyleId ?? defaultSlideStyleId
    case 'introduction':
      return introductions.program[props.itemIndex].slideStyleId ?? defaultSlideStyleId
    case 'danceSet':
      return danceSets[props.danceSetIndex].titleSlideStyleId ?? defaultSlideStyleId
    case 'intervalMusic':
      return danceSets[props.danceSetIndex].intervalMusic?.slideStyleId ?? defaultSlideStyleId
    case 'programItem': {
      return danceSets[props.danceSetIndex].program[props.itemIndex].slideStyleId ?? eventProgram.slideStyleId
    }
  }
}
