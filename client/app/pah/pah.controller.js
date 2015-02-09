'use strict';

angular.module('pahApp')
    .controller('PahCtrl', function($scope, CAHFactory, ngDialog, $stateParams, $http, $location, socket, deck, $cookies, $mdSidenav, $rootScope, $sce) {


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
        $scope.waitingGifs = [{
            img: 'http://www.ohmagif.com/wp-content/uploads/2012/11/hello-there-im-still-waiting.gif'
        }, {
            img: 'http://i108.photobucket.com/albums/n28/MikeD202/newrickroll.gif'
        }, {
            img: 'http://media.tumblr.com/tumblr_lv1kkvgkuH1qzbcrro1_500.gif'
        }, {
            img: 'http://www.gamervescent.com/wp-content/uploads/2014/11/princess-bride-waiting.gif'
        }, {
            img: 'http://i1359.photobucket.com/albums/q799/snugglyoranges/gifs/tumblr_masvr2XHyl1qcdac2o3_500.gif'
        }, {
            img: 'http://media.tumblr.com/tumblr_m02cf9dNh01qdj7w9.gif'
        }, {
            img: 'http://static.tumblr.com/00fd85d5547265fee4d0145808eb1049/ykxenm9/gHOmiuijm/tumblr_static_be_waiting.gif'
        }, {
            img: 'http://wac.450f.edgecastcdn.net/80450F/thefw.com/files/2012/09/honey-boo-boo-gif.gif'
        }, {
            img: 'http://24.media.tumblr.com/tumblr_mdl5kiCvZS1rhebako1_500.gif'
        }, ];
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

        // function unicodeToChar(text) {
        //    return text.replace(/\\u[\dABCDEFabcdef][\dABCDEFabcdef][\dABCDEFabcdef][\dABCDEFabcdef]/g, 
        //       function (match) {
        //            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        //       });
        // }



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
            $scope.getGif();
            CAHFactory.startRound();
        }

        $scope.$on('playerJoined', function() {
            $scope.noPlayer = false;
        })

         $scope.getGif = function () {
            var item = $scope.waitingGifs[Math.floor(Math.random()*$scope.waitingGifs.length)];
            $scope.gif = item.img;
         }
         $scope.getGif();


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

