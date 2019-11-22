const app = require('../../src/app');

describe('\'workshops\' service', () => {
  it('registered the service', () => {
    const service = app.service('workshops');
    expect(service).toBeTruthy();
  });
});
