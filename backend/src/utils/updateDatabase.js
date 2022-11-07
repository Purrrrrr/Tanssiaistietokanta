module.exports = async function updateDatabase(service, updater) {
  const items = await service.findAsync()

  for (const item of items) {
    const newItem = await updater(item)
    if (newItem !== undefined) {
      await service.updateAsync({ _id: item._id}, newItem)
    }
  }
}
