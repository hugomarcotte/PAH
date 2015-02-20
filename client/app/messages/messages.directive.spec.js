'use strict';

describe('Directive: messages', function () {

  // load the directive's module and view
  beforeEach(module('pahApp'));
  beforeEach(module('app/messages/messages.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<messages></messages>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the messages directive');
  }));
});