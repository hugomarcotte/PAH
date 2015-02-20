'use strict';

describe('Directive: toolbarTools', function () {

  // load the directive's module and view
  beforeEach(module('pahApp'));
  beforeEach(module('app/toolbarTools/toolbarTools.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<toolbar-tools></toolbar-tools>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the toolbarTools directive');
  }));
});