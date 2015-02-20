'use strict';

describe('Controller: ScoreboardCtrl', function () {

  // load the controller's module
  beforeEach(module('pahApp'));

  var ScoreboardCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScoreboardCtrl = $controller('ScoreboardCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
