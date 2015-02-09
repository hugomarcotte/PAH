'use strict';

angular.module('pahApp')
    .controller('PahCtrl', function($scope, CAHFactory, ngDialog, $stateParams, $http, $location, socket, deck, $cookies, $mdSidenav, $rootScope, gifly) {

        $scope.getGif = function (judgeGifs, waitingGifs) {
            var waitingGif = waitingGifs[Math.floor(Math.random()*waitingGifs.length)];
            var judgeGif = judgeGifs[Math.floor(Math.random()*judgeGifs.length)];
            $scope.waitingGif = waitingGif;
            $scope.judgeGif = judgeGif;
         }
         // $scope.getGif();


        gifly.buildGifs().success(function(data){
            console.log(data)
            $scope.waitingGifs = data.gifs.waitingGifs;
            $scope.judgeGifs = data.gifs.judgeGifs;
            $scope.getGif($scope.judgeGifs, $scope.waitingGifs);


            // $scope.waitingGif = $scope.waitingGifs[0]; 
            // $scope.judgeGif = $scope.judgeGifs [0]; 

        });

        //// CAHFactory.init(playerName, callback)
        //// if you include a playerName, init will also join you to the game
        //
        //// CAHFactory.join(playerName, code, callback)
        //
        //$scope.examplePrivatePlayArea = CAHFactory.getPrivatePlayArea();
        //// access each card using exampleHand.hand[i], which is the full object
        //
        //$scope.examplePublicPlayArea = CAHFactory.getPublicPlayArea();
        //// access the public play area (not the scoreboard)
        ////
        //// {
        ////   blackCard: {},
        ////   submittedCards: [],
        ////   judgeMode: false,  // true if everyone has submitted a card?
        ////   currentJudge: {} // user info of judge
        //// }
        //
        //$scope.exampleScoreboard = CAHFactory.getScoreboard();
        //// get the scoreboard, which includes the array of all players
        //
        //$scope.exampleMe = CAHFactory.getCurrentPlayer();
        //console.log($scope.exampleMe);
        //// get the current player's info
        //// {
        ////   info: {this is the player object},
        ////   index: 4 // index in users array for display porpoises
        //// }



        $scope.privatePlayArea = CAHFactory.getPrivatePlayArea();
        $scope.publicPlayArea = CAHFactory.getPublicPlayArea();
        $scope.scoreboard = CAHFactory.getScoreboard();
        $scope.currentPlayer = CAHFactory.getCurrentPlayer();
        $scope.judgeViewIndex = 0;
        
        // if ($scope.privatePlayArea) console.log($scope.privatePlayArea, "privatePlayArea");
        // if ($scope.publicPlayArea) console.log($scope.publicPlayArea, "publicPlayArea");
        // if ($scope.scoreboard) console.log($scope.scoreboard, "scoreboard");
        // if ($scope.currentPlayer) console.log($scope.currentPlayer, "currentPlayer");

        $scope.cardOrder = []
        $scope.submitted = false;
        $scope.noPlayer = true;
        $scope.url = $location.absUrl();
        $scope.gif = ''; 
        $scope.player = {};
        $scope.gameCode = $stateParams.code;
       

        $scope.decrementJudgeViewIndex = function () {
            if ($scope.judgeViewIndex === 0) {
                $scope.judgeViewIndex = $scope.publicPlayArea.submittedCards.length - 1; 
            } else {
                $scope.judgeViewIndex--;
            }
        }

        $scope.incrementJudgeViewIndex = function () {
            if ($scope.judgeViewIndex === $scope.publicPlayArea.submittedCards.length - 1) {
                $scope.judgeViewIndex = 0; 
            } else {
                $scope.judgeViewIndex++;
            }
        }

        $rootScope.$on('$stateChangeStart', function(){
            ngDialog.closeAll();
        })


        $scope.openJoin = function() {
            ngDialog.open({
            template: 'joinGameDialog',
            controller: 'PahCtrl'
          });


        };

        $scope.findPlayer = function(player) {
            if (!$scope.currentPlayer.info) {
                $scope.openJoin();
            } else {

                $scope.noPlayer = false;
            }
        };

        $scope.selectWhiteCard = function(whiteCard) {
            var cardArray = $scope.cardOrder
            if (whiteCard.selected) {
                whiteCard.selected = false;
                cardArray.splice(cardArray.indexOf(whiteCard), 1)
                whiteCard.order = undefined;
                cardArray.forEach(function(card, i) {
                    card.order = i + 1
                })
            } else {
                whiteCard.selected = true;
                cardArray.push(whiteCard)
                whiteCard.order = cardArray.length
            }
        };

        $scope.submitCards = function() {
            $scope.submitted = true;
            var submittedCards = [];
            $scope.privatePlayArea.hand.forEach(function(card) {
                if (card.selected) {
                    card.order=$scope.cardOrder.indexOf(card)
                    submittedCards.push(card)
                }
            });
            submittedCards.sort(function(a,b){
                return a.order-b.order
            });
            console.log("SUBMITTED CARDS ORDER", submittedCards);
            //console.log($scope.currentPlayer);
            CAHFactory.play(submittedCards, $scope.currentPlayer.info._id);
            $scope.cardOrder = []; //CAHFactory.play should be rewritten to accet an array of card objects
        };

        $scope.startRound = function() {
            $scope.getGif($scope.judgeGifs, $scope.waitingGifs);
            CAHFactory.startRound();
        }

        $scope.$on('playerJoined', function() {
            $scope.noPlayer = false;
        })

         


        deck.getDeck('base', function() {
            $scope.deck = deck.getCurrentDeck();
            //console.log($scope.deck);
        })

        $scope.openLinkDialog = function() {
            console.log('hey');
            ngDialog.open({
                template: 'getLinkDialog',
                controller: 'PahCtrl'
            });
        };

        $scope.calStackCardsMargin = function(nbOfCards) {
            var screenSize = angular.element(document.querySelectorAll(".leftSide")[0])[0].clientWidth;
            //Remove padding;
            screenSize = screenSize - 20;
            // +1 at the end is a mystery but seems to be working with any number of Cards
            return Math.floor(((nbOfCards * 100) - screenSize) / (nbOfCards - 1)) + 1;
        };

        $scope.sendText = function() {
            $http.post('/api/pahs/invite', {
                    phoneNumber: $scope.phoneNumber,
                    link: $scope.url
                })
                .success(function(data) {
                    console.log('successfully texted');
                    ngDialog.close();
                })
        };

            $scope.drawCard = function() {
            console.log('drawing card...');
            CAHFactory.draw(10 - $scope.privatePlayArea.hand.length);
        };

        $scope.join = function(playerName) {
            if (playerName){
                $rootScope.$broadcast('playerJoined', {});
                CAHFactory.join(playerName, $scope.gameCode);
                ngDialog.close();
            } 
        };


        $scope.waitingForStart = function () {
             if ($scope.scoreboard.users[0]) {
                 return !(($scope.scoreboard.users[0].cards.length > 0) || $scope.noPlayer);
             }
            
        }

        $scope.judgeWaiting = function () {
            if($scope.currentPlayer.info && $scope.scoreboard.users[0]) {
                return $scope.currentPlayer.info.isJudge && !$scope.publicPlayArea.judgeMode && ($scope.scoreboard.users[0].cards.length > 0) && !$scope.noPlayer;
            }   
        };

        // $scope.showSubmitCardsButton = !$scope.currentPlayer.info.isJudge && $scope.currentPlayer.info.cards && !$scope.publicPlayArea.judgeMode;
        

        $scope.hideWhiteCards = function () {
            if ($scope.currentPlayer.info && $scope.publicPlayArea) {
                return $scope.currentPlayer.info.isJudge || $scope.publicPlayArea.judgeMode;
            }     
        }

        $scope.isJudge = true;



        deck.getDeck('base', function() {
            $scope.deck = deck.getCurrentDeck();
            //console.log($scope.deck);
        })

        $scope.openLinkDialog = function() {
            console.log('hey');
            ngDialog.open({
                template: 'getLinkDialog',
                controller: 'PahCtrl'
            });
        };



        $scope.calStackCardsMargin = function(nbOfCards) {
          var screenSize = angular.element(document.querySelectorAll(".leftSide")[0])[0].clientWidth;

          //Remove padding;
          screenSize = screenSize -20;
          // +1 at the end is a mystery but seems to be working with any number of Cards
          return Math.floor(((nbOfCards * 100) - screenSize) / (nbOfCards - 1))+1;
        };



        $scope.sendText = function() {
            $http.post('/api/pahs/invite', {
                    phoneNumber: $scope.phoneNumber,
                    link: $scope.url
                })
                .success(function(data) {
                    console.log('successfully texted');
                    ngDialog.close();
                })
        };


        $scope.openSidenav = function() {
          $mdSidenav('left').toggle();
        }
        $scope.closeSideNav = function() {
          $mdSidenav('left').toggle();
        }

        $scope.selectWinner = function (submission) {
            console.log(submission);
            CAHFactory.judge(submission);
        }

        $scope.noSubmit = function() {
            if ($scope.privatePlayArea.hand && $scope.publicPlayArea.blackCard) {
                var submitedCards = [];
                $scope.privatePlayArea.hand.forEach(function(card) {
                    if (card.selected) {
                        submitedCards.push(card);
                    }
                 });
                if ($scope.publicPlayArea.blackCard.numAnswers === submitedCards.length) {
                    return false;
                } else {
                    return true;
                }
            }
        };

 });

