import {guid} from "utils/guid";

const objectIdMap = new WeakMap();

export function objectId(object){
  if (typeof(object) === "string") return object;
  if (object._id) return object._id
  if (!objectIdMap.has(object)) {
    objectIdMap.set(object,guid());
  }
  return objectIdMap.get(object);
}
export function setObjectId(object, id) {
  if (typeof(object) === "string") return;
  if (object._id) return;
  objectIdMap.set(object, id);
}
