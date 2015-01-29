'use strict';

angular.module('pahApp')
  .controller('MainCtrl', function ($scope, CAHFactory, ngDialog) {

    $scope.test = 'test1';


    $scope.startNow = function () {
      ngDialog.open({ template: 'startGameDialog', controller: 'MainCtrl' });
    };


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
