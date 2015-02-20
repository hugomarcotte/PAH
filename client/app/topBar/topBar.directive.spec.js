'use strict';

describe('Directive: topBar', function () {

  // load the directive's module and view
  beforeEach(module('pahApp'));
  beforeEach(module('app/topBar/topBar.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<top-bar></top-bar>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the topBar directive');
  }));
});