const app = require('../../src/app');

describe('\'dances\' service', () => {
  it('registered the service', () => {
    const service = app.service('dances');
    expect(service).toBeTruthy();
  });
});
