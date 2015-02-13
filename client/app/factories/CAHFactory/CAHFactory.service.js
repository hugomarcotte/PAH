'use strict';

angular.module('pahApp')
    .factory('CAHFactory', function($http, deck, $cookies, socket) {
        var gameId = '';
        var factoryMethods = {};
        var gameState;
        var currentPlayer = {};
        var privatePlayArea = {
            hand: []
        }
        var publicPlayArea = {
            blackCard: {},
            submittedCards: [],
            judgeMode: false,
            currentJudge: {},
            mostRecentWin: []
        };
        var scoreboard = {
            users: []
        }
        var isPlayer = false;


        // we probably shouldn't use this if we can avoid it
        factoryMethods.getState = function() {
            return gameState;
        };

        factoryMethods.getPrivatePlayArea = function() {
            return privatePlayArea;
        };

        factoryMethods.getPublicPlayArea = function() {
            return publicPlayArea;
        }

        factoryMethods.getScoreboard = function() {
            return scoreboard;
        };

        factoryMethods.getCurrentPlayer = function() {
            return currentPlayer;
        }

        factoryMethods.getPlayers = function() {
            return this.getScoreboard();
        }

        factoryMethods.init = function(playerName, callback) {
            var self = this;

            $http.post('/api/pahs/', {})
                .success(function(state) {
                    console.log('new game state: ', state);
                    if (playerName) {
                        self.join(playerName, state.code, callback);
                    } else {
                        if (callback) callback(state);
                        //self.spectate(state.code, callback);
                    }
                })
                .error(function(err) {
                    console.log('Failed to initialize game: ', err);
                });
        };

        factoryMethods.getGameByCode = function(code, callback) {
            var self = this;

            //console.log(code);
            $http.get('/api/pahs/' + code, {})
                .success(function(state) {
                    console.log('new game state: ', state);
                    gameId = state._id;
                    callback(state);
                })
                .error(function(err) {
                    console.log('Failed to initialize game: ', err);
                });
        };

        factoryMethods.draw = function(numCards) {
            if (numCards === null) numCards = 1;
            // console.log(gameState);
            var drawInfo = deck.drawCard(gameState.discardedWhite, numCards);

            $http.put('api/pahs/' + gameId + '/draw/' + currentPlayer.info._id, {
                cardsWeDrew: drawInfo.cardsWeDrew
            }).success(function(data) {

                privatePlayArea.hand = privatePlayArea.hand.concat(drawInfo.cards);
                // console.log(privatePlayArea.hand, "LOOK AT THIS");
                // console.log(data);
            });
        }

        factoryMethods.play = function(cards, userId) {
            console.log('you just played card number: ', cards);
            $http.put('/api/pahs/' + gameId + '/submit/' + userId + '', {
                    cards: cards
                })
                .success(function(data) {
                    var hand = privatePlayArea.hand
                    cards.forEach(function(card) {
                            hand.splice(hand.indexOf(card), 1)
                        })
                        // console.log('Played card', card);
                        //factoryMethods.draw(10 - hand.length);
                })
                .error(function(err) {
                    console.log('Failed to join game: ', err);
                });
            return;
        };

        factoryMethods.judge = function(cards) {
            $http.put('/api/pahs/' + gameId + '/judge/', {
                    cards: cards
                })
                .success(function(data) {
                    //factoryMethods.startRound();
                    console.log('Judged this card as the winner:', cards);
                })
                .error(function(err) {
                    console.log('Failed to judge: ', err);
                });
            return;
        };

        factoryMethods.randomJudge = function() {
            // do some promise logic stuff to make sure it's judge mode when this executes
            // Pick a random number
            // call judge with that index of the array
        }

        factoryMethods.spectate = function(joinCode, callback) {
            // console.log('Im calling spectate');
            if (gameState && joinCode !== gameState.code) resetFactory();
            var self = this;
            return $http.get('/api/pahs/' + joinCode)
                .success(function(state) {
                    socket.socket.emit('join', 'pah/' + state._id);

                    if (callback) callback(state);
                    gameId = state._id;
                    updatePlayArea(state);
                    registerStateSocket();
                    if (self.rejoin(joinCode)) {
                        console.log('rejoining...');
                        if (callback) return callback(joinCode);
                    }
                });
        };

        function resetFactory() {
            console.log('resetting...');
            gameId = '';
            gameState = undefined;
            currentPlayer.info = undefined;
            privatePlayArea.hand = [];

            publicPlayArea.blackCard = {}
            publicPlayArea.submittedCards = [];
            publicPlayArea.judgeMode = false,
                publicPlayArea.currentJudge = {}

            scoreboard.users = [];
            isPlayer = false;
        }

        factoryMethods.join = function(name, joinCode, callback) {
            //console.log(arguments);

            //console.log('am I here?');

            // check the cookie to see whether we rejoin or not
            // if (this.rejoin(joinCode)) {
            //     console.log('rejoining...');
            //     if (callback) return callback(joinCode);
            //     return;
            // }
            $http.post('/api/pahs/' + gameState.code, {
                    'name': name
                })
                .success(function(data) {
                    if (callback) callback(data);
                    //console.log('success!');
                    joinHelper(data);

                    if ($cookies.games) {
                        var cookies = JSON.parse($cookies.games);
                        cookies.push({
                            gameCode: joinCode,
                            userId: currentPlayer.info._id
                        });
                        $cookies.games = JSON.stringify(cookies);
                    } else {

                        // Set the cookie for this player
                        $cookies.games = JSON.stringify([{
                            gameCode: joinCode,
                            userId: currentPlayer.info._id
                        }]);
                        if (callback) callback(joinCode);
                    }
                })
                .error(function(err) {
                    console.log('Failed to join game: ', err);
                });
        };

        factoryMethods.leave = function() {
            return factoryMethods.deactivatePlayer(currentPlayer.info, true);
        }

        factoryMethods.deactivateMe = function() {
            return factoryMethods.deactivatePlayer(currentPlayer.info);
        }

        factoryMethods.deactivatePlayer = function(player, leaving) {
            // if (player.isJudge) {
            //     this.randomJudge();
            // }
            if (currentPlayer.info.isInactive && !leaving) return;
            isPlayer = false;
            $http.put('/api/pahs/' + gameId + '/deactivate/' + player._id + '', {
                    hasLeft: leaving
                })
                .success(function(data) {});
        };

        factoryMethods.reactivateMe = function() {
            if (!currentPlayer.info.isInactive) return;
            $http.put('/api/pahs/' + gameId + '/reactivate/' + currentPlayer.info._id + '', {})
                .success(function(data) {});
        }

        function joinHelper(data) {
            //gameId = data.state._id;
            isPlayer = true;
            updatePlayArea(data.state);

            gameState.users.forEach(function(user) {
                    if (user._id == data.playerId) {
                        currentPlayer.index = user.index;
                        currentPlayer.info = user;
                    }
                })
                // console.log('currentPlayer: ', currentPlayer);
            if (currentPlayer.info.cards.length) {
                privatePlayArea.hand = deck.populate(currentPlayer.info.cards);
            }
            if (publicPlayArea.blackCard && publicPlayArea.blackCard.text && !publicPlayArea.judgeMode && !currentPlayer.info.hasSubmitted) {
                factoryMethods.draw(10 - privatePlayArea.hand.length);
            }
            if (currentPlayer.info.isInactive) {
                console.log('REACTIVATING!!!!!')
                factoryMethods.reactivateMe();
            }
            //registerStateSocket();
        }

        // this shouldn't be externally facing,
        // should just get called when join finds that
        // you're already in the game
        factoryMethods.rejoin = function(joinCode, cb) {
            // console.log('cookies.games', $cookies.games);
            if (!$cookies.games) {
                return false;
            }

            /// parse it check it push it stringify it reset it
            // console.log($cookies.games)
            var cookies = JSON.parse($cookies.games);
            var playerId;
            // console.log('cookies array', cookies);
            cookies.forEach(function(game) {
                if (joinCode === game.gameCode) {
                    playerId = game.userId;
                }
            })
            if (!playerId) {
                return false;
            }
            joinHelper({
                state: gameState,
                playerId: playerId
            });
            return true;
        };

        function registerStateSocket() {
            socket.socket.on('update', updatePlayArea);
        }

        function updatePlayArea(newState) {
            console.log('updating with: ', newState);
            // console.log(newState);
            gameState = newState;
            if (isPlayer || currentPlayer.index) {
                console.log('player info', currentPlayer.info)
                currentPlayer.info = newState.users[currentPlayer.index];
                if (currentPlayer.info) {
                    if (currentPlayer.info.isInactive) {
                        isPlayer = false;
                    } else {
                        isPlayer = true;
                    }
                }
            }
            publicPlayArea.blackCard = newState.blackCard;
            publicPlayArea.submittedCards = newState.cardsInPlay;
            publicPlayArea.currentJudge = newState.users[newState.currentJudge] || {};
            publicPlayArea.judgeMode = newState.judgeMode;
            scoreboard.users = newState.users;

console.log('MOST RECENT WIN: ', newState.mostRecentWin);
            if (newState.mostRecentWin.length) {
                publicPlayArea.mostRecentWin = newState.mostRecentWin;
            } else {
                publicPlayArea.mostRecentWin = [];
            }

            if (isPlayer && newState.currentDrawingUser == currentPlayer.index) {
                factoryMethods.draw(10 - privatePlayArea.hand.length);
            }
        }


        // only one person calls this?
        factoryMethods.startRound = function() {
            // players draw cards in order
            $http.put('/api/pahs/' + gameId + '/start', {})
                .success(function(data) {
                    // console.log('Did the thing');
                })
                .error(function(err) {
                    console.log('Failed to start round: ', err);
                });
            // optionally start timer



        }



        // Public API here
        return factoryMethods;
    });