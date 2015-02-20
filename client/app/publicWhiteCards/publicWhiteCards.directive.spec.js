'use strict';

describe('Directive: publicWhiteCards', function () {

  // load the directive's module and view
  beforeEach(module('pahApp'));
  beforeEach(module('app/publicWhiteCards/publicWhiteCards.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<public-white-cards></public-white-cards>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the publicWhiteCards directive');
  }));
});