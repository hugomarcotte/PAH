'use strict';

describe('Directive: bottomButtons', function () {

  // load the directive's module and view
  beforeEach(module('pahApp'));
  beforeEach(module('app/bottomButtons/bottomButtons.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<bottom-buttons></bottom-buttons>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the bottomButtons directive');
  }));
});