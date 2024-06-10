import './CenteredContainer.sass'

/** A container that is horizontally centered and that also
 * streches its contents to fill it horizontally */
export function CenteredContainer(props) {
  return <div className="centered-container">
    <div {...props} />
  </div>
}
