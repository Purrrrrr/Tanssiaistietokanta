import {guid} from "utils/guid";

const objectIdMap = new WeakMap();

export function objectId(object){
  if (typeof(object) === "string") return object;
  if (!objectIdMap.has(object)) {
    objectIdMap.set(object,guid());
  }
  return objectIdMap.get(object);
}
export function setObjectId(object, id) {
  if (typeof(object) === "string") return;
  objectIdMap.set(object, id);
}
