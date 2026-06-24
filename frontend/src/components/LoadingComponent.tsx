import { useShowGlobalLoadingAnimation } from 'backend'

export default function LoadingComponent() {
  useShowGlobalLoadingAnimation(true)
  return null
}
