'use strict';

angular.module('pahApp')
    .controller('PahCtrl', function($scope, CAHFactory, ngDialog, $stateParams, $http, $location, socket, deck, $cookies, $mdSidenav, $rootScope, gifly) {

        $scope.getGif = function(judgeGifs, waitingGifs) {
                var waitingGif = waitingGifs[Math.floor(Math.random() * waitingGifs.length)];
                var judgeGif = judgeGifs[Math.floor(Math.random() * judgeGifs.length)];
                $scope.waitingGif = waitingGif;
                $scope.judgeGif = judgeGif;

            }
        

        gifly.buildGifs().success(function(data) {
            // console.log(data)
            // $scope.waitingGifs = data.gifs.waitingGifs;
            // $scope.judgeGifs = data.gifs.judgeGifs;
            $scope.judgeGifs = ["http://media.giphy.com/media/3HAYjeYNrXB0T4jof8A/giphy.gif", "http://i1142.photobucket.com/albums/n617/frankog10/23211751wf6mR7lS_zps8b231d3c.gif"];
            $scope.waitingGifs = ["http://img0.joyreactor.com/pics/post/work-newton's-cradle-cookie-monster-gif-1069931.gif", "http://www.reactiongifs.us/wp-content/uploads/2013/03/cookie_monster_waiting.gif"];
            $scope.getGif($scope.judgeGifs, $scope.waitingGifs);
        });





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

        $scope.deactivateMe = CAHFactory.deactivateMe;
        $scope.deactivatePlayer = CAHFactory.deactivatePlayer;
        $scope.reactivateMe = CAHFactory.reactivateMe;
        $scope.leave = function() {
            CAHFactory.leave();
            $location.path('/');
        };

        $scope.winner = function() {
            if ($scope.publicPlayArea.mostRecentWin.length && $scope.publicPlayArea.judgeMode) return $scope.publicPlayArea.mostRecentWin[0].userId.split('-')[0];
        }

        $scope.judge = function() {
            if ($scope.publicPlayArea.currentJudge.name) return $scope.publicPlayArea.currentJudge.name;
        }

        $scope.nonSubmits = function() {


             var nonSubmits = [];
             $scope.scoreboard.users.forEach(function(user) {
                 if (!user.hasSubmitted && !user.isJudge) nonSubmits.push(user.name);
             });
             if (nonSubmits.length === 1) {
                    return nonSubmits[0];
             } else {
                    return nonSubmits.join('</span>,<span="message-name"> ');
             }
         }
         $scope.judgeWaitingM = "";
         $scope.judgeWaitingMsg = function() {
            var string = "You are the judge!<br>Waiting for <span class='message-name'>" + $scope.nonSubmits() + "</span> to submit.";
            $scope.judgeWaitingM = string;
        }

         $scope.hideComma = function(user) {
            // console.log(user);
           var nonSubmits = [];
             $scope.scoreboard.users.forEach(function(user) {
                 if (!user.hasSubmitted && !user.isJudge && !user.isInactive) nonSubmits.push(user);
             });
             // console.log(user)
             if (nonSubmits[nonSubmits.length - 1] && user) {
               if (nonSubmits[nonSubmits.length - 1]._id === user._id) {
                    return true;
               } else {
                    return false;
               }                
             }
         }
         

        $scope.decrementJudgeViewIndex = function() {
            if ($scope.judgeViewIndex === 0) {
                $scope.judgeViewIndex = $scope.publicPlayArea.submittedCards.length - 1;
            } else {
                $scope.judgeViewIndex--;
            }
        }

        $scope.incrementJudgeViewIndex = function() {
            if ($scope.judgeViewIndex === $scope.publicPlayArea.submittedCards.length - 1) {
                $scope.judgeViewIndex = 0;
            } else {
                $scope.judgeViewIndex++;
            }
        }

        $rootScope.$on('$stateChangeStart', function() {
            ngDialog.closeAll();
            CAHFactory.leave();
        });

        window.onbeforeunload = function() {
            CAHFactory.leave();
        }



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
                if ($scope.currentPlayer.isInactive) {
                    alert("hellO");
                }
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
            } else if (!(cardArray.length >= $scope.publicPlayArea.blackCard.numAnswers)) {
                whiteCard.selected = true;
                cardArray.push(whiteCard)
                whiteCard.order = cardArray.length
            } else {
                whiteCard.selected = true;
                cardArray[cardArray.length - 1].selected = false;
                cardArray[cardArray.length - 1].order = undefined;
                cardArray[cardArray.length - 1] = whiteCard;
                whiteCard.order = cardArray.length;
            }
        };

        $scope.submitCards = function() {
            var cardArray = $scope.cardOrder;
            if (cardArray.length !== $scope.publicPlayArea.blackCard.numAnswers) return false;

            $scope.submitted = true;
            var submittedCards = [];
            $scope.privatePlayArea.hand.forEach(function(card) {
                if (card.selected) {
                    card.order = $scope.cardOrder.indexOf(card)
                    submittedCards.push(card)
                }
            });
            submittedCards.sort(function(a, b) {
                return a.order - b.order
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



        $scope.deck = deck.getCurrentDeck();
        // console.log('this is the deck!', $scope.deck);


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
            if (playerName) {
                $rootScope.$broadcast('playerJoined', {});
                CAHFactory.join(playerName, $scope.gameCode);
                ngDialog.close();
            }
        };


        $scope.waitingForStart = function() {
            return $scope.publicPlayArea.gameState == 'lobby';
            if ($scope.scoreboard.users[0]) {
                return !(($scope.scoreboard.users[0].cards.length > 0) || $scope.noPlayer);
            }

        }

        $scope.judgeWaiting = function() {
            if ($scope.publicPlayArea.gameState !== 'play') return false;
            return $scope.currentPlayer.info.isJudge;
            if ($scope.currentPlayer.info && $scope.scoreboard.users[0]) {
                return $scope.currentPlayer.info.isJudge && !$scope.publicPlayArea.judgeMode && ($scope.scoreboard.users[0].cards.length > 0) && !$scope.noPlayer;
            }
        };

        // $scope.showSubmitCardsButton = !$scope.currentPlayer.info.isJudge && $scope.currentPlayer.info.cards && !$scope.publicPlayArea.judgeMode;


        $scope.hideWhiteCards = function() {
            if ($scope.currentPlayer.info && $scope.publicPlayArea) {
                return $scope.currentPlayer.info.isJudge || $scope.publicPlayArea.judgeMode;
            }
        }

        $scope.isJudge = true;

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


        $scope.openSidenav = function() {
            $mdSidenav('left').toggle();
        }
        $scope.closeSideNav = function() {
            $mdSidenav('left').toggle();
        }

        $scope.selectWinner = function(submission) {
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