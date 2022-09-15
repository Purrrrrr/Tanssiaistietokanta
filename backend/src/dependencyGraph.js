const {
  updateDependencies,
  registerDependencies,
  clearDependencies,
  getItemDependencies,
} = require('./utils/dependencies');
const {
  loadDependencyTypes
} = require('./utils/dependencyRelations');


const serviceDependencyRelations = {};
const serviceReverseDependencyRelations = {};

function init(app) {
  for (const [serviceName, service] of Object.entries(app.services)) {
    serviceDependencyRelations[serviceName] = [];
    serviceReverseDependencyRelations[serviceName] = [];
    service.on('created', data => registerDependencies(serviceName, data, serviceDependencyRelations[serviceName]));
    service.on('updated', data => updateDependencies(serviceName, data, serviceDependencyRelations[serviceName]));
    service.on('patched', data => updateDependencies(serviceName, data, serviceDependencyRelations[serviceName]));
    service.on('removed', data => clearDependencies(serviceName, data));
  }

  for (const serviceName of Object.keys(app.services)) {
    const dependencyRelations = loadDependencyTypes(serviceName);
    if (!dependencyRelations) continue;

    serviceDependencyRelations[serviceName] = dependencyRelations;
    dependencyRelations.forEach(relation => {
      serviceReverseDependencyRelations[relation.service].push(relation);
    });
  }

  // console.log(serviceDependencyRelations);

  loadInitialDependencies(app);
}


async function loadInitialDependencies(app) {
  for (const [serviceName, relations] of Object.entries(serviceDependencyRelations)) {
    if (relations.length === 0) continue;
    const service = app.service(serviceName);
    const items = await service.find({});
    items.forEach(item => registerDependencies(serviceName, item, relations));
  }
  // console.dir(serviceItemDependencies, { depth: null});
}


module.exports = {
  init,
};
