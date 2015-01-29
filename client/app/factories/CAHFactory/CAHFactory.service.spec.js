'use strict';

describe('Service: CAHFactory', function () {

  // load the service's module
  beforeEach(module('pahApp'));

  // instantiate service
  var CAHFactory;
  beforeEach(inject(function (_CAHFactory_) {
    CAHFactory = _CAHFactory_;
  }));

  it('should do something', function () {
    expect(!!CAHFactory).toBe(true);
  });

});
