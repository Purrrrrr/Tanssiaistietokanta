const app = require('../../src/app');

describe('\'convert\' service', () => {
  it('registered the service', () => {
    const service = app.service('convert');
    expect(service).toBeTruthy();
  });
});
