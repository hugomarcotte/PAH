'use strict';

describe('Directive: scoreboard', function () {

  // load the directive's module and view
  beforeEach(module('pahApp'));
  beforeEach(module('app/scoreboard/scoreboard.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<scoreboard></scoreboard>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the scoreboard directive');
  }));
});