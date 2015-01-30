'use strict';

describe('Controller: BackendSandboxCtrl', function () {

  // load the controller's module
  beforeEach(module('pahApp'));

  var BackendSandboxCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BackendSandboxCtrl = $controller('BackendSandboxCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
