'use strict';

describe('Directive: gif', function () {

  // load the directive's module and view
  beforeEach(module('pahApp'));
  beforeEach(module('app/gif/gif.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<gif></gif>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the gif directive');
  }));
});