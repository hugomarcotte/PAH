'use strict';

describe('Directive: topButtons', function () {

  // load the directive's module and view
  beforeEach(module('pahApp'));
  beforeEach(module('app/topButtons/topButtons.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<top-buttons></top-buttons>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the topButtons directive');
  }));
});