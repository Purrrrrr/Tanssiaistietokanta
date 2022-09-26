const assert = require('assert');
const preventRemovingOfUsedItems = require('../../src/hooks/prevent-removing-of-used-items');

describe('\'prevent-removing-of-used-items\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = preventRemovingOfUsedItems();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
