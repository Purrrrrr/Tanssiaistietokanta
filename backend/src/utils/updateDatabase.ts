import NeDB from '@seald-io/nedb'

export default async function updateDatabase(service: NeDB, updater: (i: unknown) => unknown) {
  const items = await service.findAsync({})

  for (const item of items) {
    const newItem = await updater(item)
    if (newItem !== undefined) {
      await service.updateAsync({ _id: item._id }, newItem)
    }
  }
}
