'use strict';

angular.module('pahApp')
  .controller('MainCtrl', function ($scope, $http, socket, CAHFactory) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });

    console.log(CAHFactory.init());
    console.log(CAHFactory.draw());
    console.log(CAHFactory.play(24));
    console.log(CAHFactory.judge(24));
    console.log(CAHFactory.join('John', '4815162342'))
    console.log(CAHFactory.getCurrentHand());
    console.log(CAHFactory.getCardsInPlay());
    console.log(CAHFactory.getScoreboard());
    console.log(CAHFactory.rejoin(0, '4815162342'))


  });
