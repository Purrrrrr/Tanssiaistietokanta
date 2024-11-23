import {useCallback } from 'react'
import {useSwipeable} from 'react-swipeable'

import {useOnKeydown} from 'utils/useOnKeydown'

interface Slide {
  id: string
  parentId?: string
}

type SlideNavigationProps = {
  slides: Slide[]
  onChangeSlide: (slide: Slide, index: number) => unknown
  currentSlideIndex?: number
  currentSlideId?: string
} & (
  { currentSlideIndex: number } | { currentSlideId: string }
)

export function useSlideshowNavigation(
  {slides, currentSlideIndex, currentSlideId, onChangeSlide}: SlideNavigationProps
) {
  const slideIndex = currentSlideIndex ??
    (i => i === -1 ? 0 : i)(slides.findIndex(slide => slide.id === currentSlideId))
  const slide = slides[slideIndex]

  const getBoundedSlideIndex = useCallback(
    function getSlideForIndex(index: number) {
      return Math.min(Math.max(index, 0), slides.length-1)
    },
    [slides.length]
  )

  const changeSlide = useCallback((indexDelta: number) => {
    const nextIndex = getBoundedSlideIndex(slideIndex + indexDelta)
    onChangeSlide(slides[nextIndex], nextIndex)
  }, [slides, slideIndex, onChangeSlide, getBoundedSlideIndex])

  useOnKeydown({
    ArrowLeft: () => changeSlide(-1),
    ArrowRight: () => changeSlide(1),
  })

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => changeSlide(1),
    onSwipedRight: () => changeSlide(-1),
    onSwipedUp: () => {
      const nextIndex = slides.findIndex(s => s.id === slide.parentId)
      if (nextIndex !== -1) {
        onChangeSlide(slides[nextIndex], nextIndex)
      }
    },
  })

  return {
    swipeHandlers, slideIndex, getBoundedSlideIndex,
  }
}
