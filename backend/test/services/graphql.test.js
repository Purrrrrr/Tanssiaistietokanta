const app = require('../../src/app');

describe('\'graphql\' service', () => {
  it('registered the service', () => {
    const service = app.service('graphql');
    expect(service).toBeTruthy();
  });
});
