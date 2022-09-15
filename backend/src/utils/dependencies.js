const serviceItemDependencies = new Map();

/* Types of depencies
 *
 * childOf <-> parentOf
 *
 * The parts are deleted with the parent
 *
 * usedBy <-> uses
 *
 * The used cannot be deleted while the parent uses them
 *
 * event uses dances and eventProgram
 * workshops are part of events
 */
const dependencyTypePairs = {
  usedBy: 'uses',
  uses: 'usedBy',
  childOf: 'parentOf',
  parentOf: 'childOf',
};

function registerDependencies(sourceService, item, relations) {
  if (Array.isArray(item)) {
    item.forEach(i => registerDependencies(sourceService, i, relations));
    return;
  }
  relations.forEach(
    (relation) => {
      const {getLinkedIds} = relation;
      const ids = getLinkedIds(item);
      
      ids.forEach(id => {
        registerDepedency({
          sourceId: item._id,
          targetId: id,
          relation,
        });
      });
    }
  );
}

function registerDepedency({sourceId, targetId, relation}) {
  const sourceNode = getItemDependencies(relation.sourceService, sourceId);
  const targetNode = getItemDependencies(relation.service, targetId);

  const sourceRelationIds = getOrComputeDefault(sourceNode.dependencies, relation, () => new Set());
  const targetRelationIds = getOrComputeDefault(targetNode.reverseDependencies, relation, () => new Set());

  sourceRelationIds.add(targetId);
  targetRelationIds.add(sourceId);
}
    
function updateDependencies(serviceName, item, relations) {
  clearDependencies(serviceName, item);
  registerDependencies(serviceName, item, relations);
  console.log(serviceName, item._id);
  console.log(isUsedBySomething(serviceName, item._id));
  console.log(getLinks(serviceName, item._id));
}

function clearDependencies(service, item) {
  if (Array.isArray(item)) {
    item.forEach(i => clearDependencies(service, i));
    return;
  }
  const id = item._id;
  const deps = getItemDependencies(service, id);
  for (const [relation, targetIds] of deps.dependencies.entries()) {
    for (const targetId of targetIds) {
      const targetDeps = getItemDependencies(relation.service, targetId);
      targetDeps.reverseDependencies.get(relation).delete(id);
    }
  }
  deps.dependencies = new Map();
}

function getItemDependencies(service, id) {
  const deps = getOrComputeDefault(serviceItemDependencies, service, () => new Map());
  return getOrComputeDefault(deps, id, () => ({
    dependencies: new Map(),
    reverseDependencies: new Map(),
  }));
}

function isUsedBySomething(service, id) {
  return getLinks(service, id, 'usedBy').size > 0;
}

function getLinks(service, id, linkType) {
  const {dependencies, reverseDependencies} = getItemDependencies(service, id);
  const links = {
    usedBy: new Map(),
    uses: new Map(),
    childOf: new Map(),
    parentOf: new Map(),
  };

  for (const [relation, ids] of dependencies.entries()) {
    if (linkType && relation.type !== linkType) continue;

    const idSet = getOrComputeDefault(links[relation.type], relation.service, () => new Set());
    ids.forEach(id => idSet.add(id));
  }
  for (const [relation, ids] of reverseDependencies.entries()) {
    if (linkType && relation.type !== dependencyTypePairs[linkType]) continue;

    const idSet = getOrComputeDefault(links[dependencyTypePairs[relation.type]], relation.sourceService, () => new Set());
    ids.forEach(id => idSet.add(id));
  }

  if (linkType) return links[linkType];
  return links;
}

function getOrComputeDefault(map, key, getDefault) {
  if (!map.has(key)) {
    const value = getDefault(key);
    map.set(key, value);
    return value;
  }
  return map.get(key);
}

module.exports = {
  updateDependencies,
  registerDependencies,
  clearDependencies,
  getItemDependencies,
  isUsedBySomething,
  serviceItemDependencies,
};
