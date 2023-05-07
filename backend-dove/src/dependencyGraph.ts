import { updateDependencies, registerDependencies, clearDependencies } from './utils/dependencies'
import { loadDependencyTypes } from './utils/dependencyRelations'
import type { Application, ServiceTypes } from './declarations'

type ServiceName = keyof ServiceTypes
const serviceDependencyRelations : Partial<Record<ServiceName, any>> = {}
const serviceReverseDependencyRelations : Partial<Record<ServiceName, any>> = {}

export default async function init(app: Application) {
  const serviceNames = (Object.keys(app.services) as ServiceName[])
  serviceNames.forEach((serviceName: ServiceName) => {
    const service = app.service(serviceName as keyof ServiceTypes)
    serviceDependencyRelations[serviceName] = []
    serviceReverseDependencyRelations[serviceName] = []
    service.on('created', data => registerDependencies(serviceName, data, serviceDependencyRelations[serviceName]))
    service.on('updated', data => updateDependencies(serviceName, data, serviceDependencyRelations[serviceName]))
    service.on('patched', data => updateDependencies(serviceName, data, serviceDependencyRelations[serviceName]))
    service.on('removed', data => clearDependencies(serviceName, data))
  })

  for (const serviceName of serviceNames) {
    const dependencyRelations = await loadDependencyTypes(serviceName)

    serviceDependencyRelations[serviceName] = dependencyRelations
    dependencyRelations.forEach(relation => {
      serviceReverseDependencyRelations[relation.service as ServiceName].push(relation)
    })
  }

  await loadInitialDependencies(app)
}


async function loadInitialDependencies(app: Application) {
  for (const [serviceName, relations] of Object.entries(serviceDependencyRelations)) {
    if (relations.length === 0) continue
    const service = app.service(serviceName as ServiceName) as ServiceTypes[keyof ServiceTypes]
    const items = await service.find({})

    if (!Array.isArray(items)) continue
    items.forEach(item => registerDependencies(serviceName, item, relations))
  }
}
