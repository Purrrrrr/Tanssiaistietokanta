import {useNavigate, useParams} from 'react-router-dom'

export function useLinkToSlide() {
  const { eventId, eventVersionId } = useParams()
  return eventVersionId
    ? (slideId: string) => `/events/${eventId}/version/${eventVersionId}/program/slides/${slideId}`
    : (slideId: string) => `/events/${eventId}/program/slides/${slideId}`
}

export function useNavigateToSlide() {
  const linkToSlide = useLinkToSlide()
  const navigate = useNavigate()

  return (slideId: string) => navigate(linkToSlide(slideId))
}
