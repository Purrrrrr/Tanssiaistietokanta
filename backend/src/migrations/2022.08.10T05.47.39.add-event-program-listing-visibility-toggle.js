/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const {
    ['event-program']: eventProgramDb
  } = params.context.models

  await eventProgramDb.updateAsync({}, { $set: { showTitleInDanceSet: true } }, { multi: true })
};

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async params => {};
