'use strict';

describe('Filter: underscore', function () {

  // load the filter's module
  beforeEach(module('pahApp'));

  // initialize a new instance of the filter before each test
  var underscore;
  beforeEach(inject(function ($filter) {
    underscore = $filter('underscore');
  }));

  it('should return the input prefixed with "underscore filter:"', function () {
    var text = 'angularjs';
    expect(underscore(text)).toBe('underscore filter: ' + text);
  });

});
