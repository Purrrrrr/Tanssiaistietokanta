export type MetadataKey = '_id' | '_versionId' | '_versionNumber' | '_updatedAt'
export type MetadataObject = Partial<Record<MetadataKey, unknown>>
export type WithoutMetadata<T> = Omit<T, MetadataKey>
