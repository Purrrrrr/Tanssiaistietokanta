import { SkipAccessControl } from '../services/access/hooks'
import { MigrationFn } from '../umzug.context'

function parseTeachers(teachers: string | null | undefined): string[] {
  if (!teachers) return []
  return teachers
    .split(/\s*,\s*|\s+ja\s+|\s+&\s+/)
    .map(s => s.trim())
    .filter(Boolean)
}

export const up: MigrationFn = async params => {
  const { context } = params
  const volunteerService = context.getService('volunteers') as any
  const nameToId = new Map<string, string>()

  await context.updateDatabase('workshops', async (workshop: any) => {
    const { teachers, ...rest } = workshop
    const names = parseTeachers(teachers)
    const teacherIds = await Promise.all(
      names.map(async name => {
        const id = nameToId.get(name)
        if (id) return id
        const volunteer = await volunteerService.create({ name }, { [SkipAccessControl]: true })
        nameToId.set(name, volunteer._id)
        return volunteer._id
      }),
    )
    return { ...rest, teacherIds, assistantTeacherIds: [] }
  })
}

export const down: MigrationFn = async () => {}
