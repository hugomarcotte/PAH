'use strict';

describe('Service: roomFactory', function () {

  // load the service's module
  beforeEach(module('pahApp'));

  // instantiate service
  var roomFactory;
  beforeEach(inject(function (_roomFactory_) {
    roomFactory = _roomFactory_;
  }));

  it('should do something', function () {
    expect(!!roomFactory).toBe(true);
  });

});
