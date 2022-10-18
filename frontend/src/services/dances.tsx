import { setupServiceUpdateFragment, entityListQueryHook, entityCreateHook, entityDeleteHook, entityUpdateHook } from '../backend'
import { Dance } from 'types/Dance'
import {sorted} from 'utils/sorted'

const danceFields = '_id, name, description, remarks, duration, prelude, formation, category, instructions, slideStyleId'
setupServiceUpdateFragment(
  'dances',
  `fragment DanceFragment on Dance {
    ${danceFields}
  }`
)

export type { Dance }
export type WritableDanceProperty = Exclude<keyof Dance, '_id' | '__typename'>

export const dancePropertyLabels : {[Key in WritableDanceProperty]: string} = {
  name: 'Nimi',
  description: 'Kuvaus',
  remarks: 'Huomautuksia',
  duration: 'Kesto',
  prelude: 'Alkusoitto',
  formation: 'Tanssikuvio',
  category: 'Kategoria',
  instructions: 'Tanssiohjeet'
}

export const useDances = entityListQueryHook('dances', `
{
  dances {
    ${danceFields}
  }
}`)

export const useModifyDance = entityUpdateHook('dances', `
mutation modifyDance($id: ID!, $dance: DanceInput!) {
  modifyDance(id: $id, dance: $dance) {
    ${danceFields}
  }
}`, {
  parameterMapper: ({_id, __typename, ...dance}) =>
    ({variables: {id: _id, dance} })
})


export const useCreateDance = entityCreateHook('dances', `
mutation createDance($dance: DanceInput!) {
  createDance(dance: $dance) {
    ${danceFields}
  }
}`, {
  parameterMapper: (dance) => ({variables: {dance}}),
})

export const usePatchDance = entityUpdateHook('dances', `
mutation patchDance($id: ID!, $dance: DancePatchInput!) {
  patchDance(id: $id, dance: $dance) {
    ${danceFields}
  }
}`, {
  parameterMapper: ({_id: id, ...dance}) => ({variables: {id, dance}}),
})

export const useDeleteDance = entityDeleteHook('dances', `
mutation deleteDance($id: ID!) {
  deleteDance(id: $id) {
    ${danceFields}
  }
}`, {
  parameterMapper: id => ({variables: {id}})
})


export function filterDances(dances : Dance[], searchString : string) {
  return sorted<Dance>(
    dances.filter(dance => filterDance(dance, searchString)),
    (a, b) => a.name.localeCompare(b.name)
  )
}

function filterDance(dance : Dance, search : string) {
  const lSearch = search.toLowerCase()
  const lName = dance.name.toLowerCase()
  return lName.indexOf(lSearch) !== -1
}
