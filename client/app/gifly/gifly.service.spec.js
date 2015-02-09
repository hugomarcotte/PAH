'use strict';

describe('Service: gifly', function () {

  // load the service's module
  beforeEach(module('pahApp'));

  // instantiate service
  var gifly;
  beforeEach(inject(function (_gifly_) {
    gifly = _gifly_;
  }));

  it('should do something', function () {
    expect(!!gifly).toBe(true);
  });

});
