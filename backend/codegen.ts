import type { CodegenConfig } from '@graphql-codegen/cli'
 
const config: CodegenConfig = {
  schema: 'src/**/*.schema.graphql',
  generates: {
    // 'src/graphql-schema': defineConfig({
    //   resolverGeneration: 'disabled',
    // })
    'src/graphql-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        enumsAsTypes: true,
        mappers: {
          Dance: './services/dances/dances.schema#Dances',
          Wikipage: './services/dancewiki/dancewiki.schema#Dancewiki',
          File: './services/files/files.schema#FileDB',
          Document: './services/documents/documents.schema#DocumentRecord',
          Event: './services/events/events.schema#Events',
          EventRole: './services/eventRoles/eventRoles.schema#EventRoles',
          EventVolunteer: './services/eventVolunteers/eventVolunteers.schema#EventVolunteers',
          EventVolunteerAssignment: './services/eventVolunteerAssignments/eventVolunteerAssignments.schema#EventVolunteerAssignments',
          VersionHistory: './services/graphql/versionHistory.resolvers#BaseVersionHistory',
          Volunteer: './services/volunteers/volunteers.schema#Volunteers',
          Workshop: './services/workshops/workshops.schema#Workshops',
          WorkshopInstance: './services/workshops/workshops.schema#WorkshopInstanceType',
        },
      },
    }
  }
}

export default config
