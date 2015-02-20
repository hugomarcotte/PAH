'use strict';

describe('Directive: gameCode', function () {

  // load the directive's module and view
  beforeEach(module('pahApp'));
  beforeEach(module('app/gameCode/gameCode.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<game-code></game-code>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the gameCode directive');
  }));
});