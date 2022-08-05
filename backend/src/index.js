/* eslint-disable no-console */
const logger = require('./logger');
const { migrateDb }= require('./umzug');

const app = require('./app');

migrateDb(app).then(() => {
  const port = app.get('port');
  const server = app.listen(port);

  server.on('listening', () =>
    logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
  );
})

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);
