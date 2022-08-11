const app = require('../../src/app');

describe('\'eventProgram\' service', () => {
  it('registered the service', () => {
    const service = app.service('event-program');
    expect(service).toBeTruthy();
  });
});
