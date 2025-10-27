const supportsNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export function ensureIsVisible(element) {
  return wait(50).then(() => {
    if (isElementInViewport(element)) return
    if (supportsNativeSmoothScroll) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      element.scrollIntoView()
    }
    return element
  })
}

function isElementInViewport(element) {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
}
