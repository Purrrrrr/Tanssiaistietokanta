import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  params.context.updateDatabase('events', (event) => ({
    ...event as object,
    allowedViewers: ['everyone'],
  }))
}
export const down: MigrationFn = async params => {};
