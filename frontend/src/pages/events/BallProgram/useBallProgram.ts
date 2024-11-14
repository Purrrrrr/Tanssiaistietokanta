import {useBallProgramQuery} from './useBallProgramQuery'

type BallProgramData = ReturnType<typeof useBallProgramQuery>
export type Event = NonNullable<NonNullable<BallProgramData['data']>['event']>

export function useBallProgramSlides(eventId: string) : Omit<BallProgramData, 'data'> & BallProgramData['data'] {
  const {data, ...rest} = useBallProgramQuery({eventId})
  return {...data, ...rest}
}
