import { getRouteApi } from '@tanstack/react-router'

import { useEventVolunteers } from 'services/eventVolunteers'

import { useCurrentEvent } from '../../-context'

interface EventVolunteerSearchParams {
  search?: string
  role?: string
}

export function validateSearch(search: Record<string, unknown>): EventVolunteerSearchParams {
  return {
    search: typeof search.search === 'string' ? search.search : '',
    role: typeof search.role === 'string' ? search.role : undefined,
  }
}

export function useSearchEventVolunteers() {
  const event = useCurrentEvent()
  const { search, role, setSearch, setRole } = useEventVolunteerSearchParams()

  const [unsortedEventVolunteers] = useEventVolunteers({ eventId: event._id, eventVersionId: event._versionId })

  const eventVolunteers = unsortedEventVolunteers
    .filter(ev => {
      if (search && !ev.volunteer.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (role) {
        return ev.interestedIn.some(r => r._id === role)
      }
      return true
    })

  return {
    eventVolunteers,
    search, role, setSearch, setRole,
  }
}

const to = '/events/$eventId/{-$eventVersionId}/volunteers' as const
const Route = getRouteApi(`${to}/`)

function useEventVolunteerSearchParams() {
  const search = Route.useSearch()
  const params = Route.useParams()
  const navigate = Route.useNavigate()

  return {
    search: '',
    ...search,
    setSearch(newSearch: string) {
      navigate({
        to,
        params,
        search: { ...search, search: newSearch },
      })
    },
    setRole(roleId: string | undefined) {
      navigate({
        to,
        params,
        search: roleId ? { ...search, role: roleId } : { ...search, role: undefined },
      })
    },
  }
}
