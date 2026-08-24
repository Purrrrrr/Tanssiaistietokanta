import { booleanProp, showcase } from '../types'

import { GlobalSpinner } from 'libraries/ui'

export const globalSpinnerShowcase = showcase({
  title: 'Global loading indicator',
  props: {
    loading: booleanProp(),
    timeout: booleanProp(),
  },
  render: ({ loading, timeout }) =>
    <GlobalSpinner
      loading={loading}
      timeout={timeout}
      loadingMessage="Loading..."
      connectionTimeoutMessage="Connection timed out"
    />,
})
