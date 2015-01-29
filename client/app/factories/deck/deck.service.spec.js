'use strict';

describe('Service: deck', function () {

  // load the service's module
  beforeEach(module('pahApp'));

  // instantiate service
  var deck;
  beforeEach(inject(function (_deck_) {
    deck = _deck_;
  }));

  it('should do something', function () {
    expect(!!deck).toBe(true);
  });

});
