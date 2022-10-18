/** Swallow the next key up of the given keydown event
 * Used to prevent focus changing keydown handlers from triggering unwanted actions
 */
export function swallowNextKeyup({key}) {
  function swallow(event) {
    if (event.key === key) {
      event.stopPropagation()
      remove()
    }
  }
  const remove = () => document.removeEventListener('keyup', swallow, {capture: true})
  document.addEventListener('keyup', swallow, {capture: true})
  setTimeout(remove, 1000)
}
