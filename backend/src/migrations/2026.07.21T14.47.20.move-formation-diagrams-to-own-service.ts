import { isEqual } from 'es-toolkit'
import { MigrationFn } from '../umzug.context'
import randomId from '../utils/random-id'

interface Record {
  _id: string
  _updatedAt: string
  _recordDeletedAt?: string
  formationInstructions: FormationInstruction[]
}

interface FormationInstruction {
  _id: string
  ballroomId: string
  description: string
  diagram: object
}

interface FormationInstructionVersion extends FormationInstruction {
  timestamp: string
  deleted: boolean
}

export const up: MigrationFn = async params => {
  const diagramModel = params.context.getModel('formationDiagrams')
  const diagramVersionModel = params.context.getVersionModel('formationDiagrams')

  const danceVersions = await params.context.getVersionModel('dances').findAsync({}) as Record[]
  const dances = await params.context.getModel('dances').findAsync({}) as Record[]
  const withFormationInstructions = [
    ...danceVersions.filter(dance => dance.formationInstructions.length > 0),
    ...dances.filter(dance => dance.formationInstructions.length > 0),
  ]

  const diagramData = Object.groupBy(
    withFormationInstructions.flatMap(dance => {
      return dance.formationInstructions.map(instruction => {
        return {
          ...instruction,
          timestamp: dance._updatedAt,
          deleted: !!dance._recordDeletedAt,
        } as FormationInstructionVersion
      })
    }),
    diagram => diagram._id,
  )

  for (const [diagramId, diagrams] of Object.entries(diagramData)) {
    if (!diagrams?.length) continue

    const sortedDiagrams = diagrams.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    const versions = sortedDiagrams.reduce((acc, diagram) => {
      const last = acc.at(-1)
      if (!last || !versionsEqual(diagram, last)) acc.push(diagram)
      else {
        acc[Math.max(0, acc.length - 1)] = diagram
      }
      return acc
    }, [] as FormationInstructionVersion[])

    const lastVersion = versions.at(-1)
    if (!lastVersion) continue

    let versionNumber = 1
    const _createdAt = versions[0].timestamp
    for (const version of versions) {
      await diagramVersionModel.insertAsync({
        _recordId: diagramId,
        _id: randomId(9),
        _versionNumber: versionNumber++,
        _updatedAt: version.timestamp,
        _createdAt,
        _versionCreatedAt: version.timestamp,
        _recordDeletedAt: lastVersion.deleted ? lastVersion.timestamp : undefined,
        ballroomId: version.ballroomId,
        description: version.description,
        diagram: version.diagram,
      })
    }

    if (!lastVersion.deleted) {
      await diagramModel.insertAsync({
        _id: diagramId,
        _versionNumber: versionNumber,
        _updatedAt: lastVersion.timestamp,
        _createdAt,
        ballroomId: lastVersion.ballroomId,
        description: lastVersion.description,
        diagram: lastVersion.diagram,
      })
    }
  }

  await params.context.updateDatabase('dances', ({ formationInstructions, ...dance }) => ({
    ...dance,
    formationDiagramIds: (formationInstructions as Record['formationInstructions']).map(instruction => instruction._id),
  }))
}

function versionsEqual(a: FormationInstructionVersion, b: FormationInstructionVersion) {
  return a.ballroomId === b.ballroomId && a.description === b.description && isEqual(a.diagram, b.diagram)
}

export const down: MigrationFn = async () => {}
