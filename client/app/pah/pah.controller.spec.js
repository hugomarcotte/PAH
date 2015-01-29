'use strict';

describe('Controller: PahCtrl', function () {

  // load the controller's module
  beforeEach(module('pahApp'));

  var PahCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PahCtrl = $controller('PahCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
