'use strict';

angular.module('pahApp')
    .factory('CAHFactory', function($http, deck, $cookies, socket, roomFactory) {
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
            gameState: '',
            currentJudge: {},
            mostRecentWin: []
        };
        var scoreboard = {
            users: []
        }
        var isPlayer = false;

        function resetFactory() {
            console.log('resetting...');
            gameId = '';
            gameState = undefined;
            currentPlayer.info = undefined;
            currentPlayer.index = undefined;
            privatePlayArea.hand = [];

            publicPlayArea.blackCard = {}
            publicPlayArea.submittedCards = [];
            publicPlayArea.judgeMode = false;
            publicPlayArea.gameState = '';
            publicPlayArea.currentJudge = {};
            publicPlayArea.mostRecentWin = [];

            scoreboard.users = [];
            isPlayer = false;
        }

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

        factoryMethods.spectate = function(joinCode, callback) {
            if (gameState && joinCode !== gameState.code) resetFactory();
            return roomFactory.spectate('pah', joinCode, joinHelper, function(state) {

                if (callback) callback(state);
                gameId = state._id;
                updatePlayArea(state);
                registerStateSocket();
            });
        };

        factoryMethods.join = function(name, joinCode, callback) {
            return roomFactory.join('pah', name)
                .success(function(data) {
                    if (callback) callback(data);
                    //console.log('success!');
                    joinHelper(data);
                })
                .error(function(err) {
                    console.log('Failed to join game: ', err);
                });
        };

        factoryMethods.deactivateMe = function() {
            return factoryMethods.deactivatePlayer(currentPlayer.info);
        }

        factoryMethods.deactivatePlayer = function(player, leaving) {
            return roomFactory.deactivatePlayer('pah', player, leaving);

        };

        factoryMethods.reactivateMe = function() {
            return roomFactory.reactivatePlayer('pah', currentPlayer.info);
        }

        factoryMethods.init = function(playerName, callback) {
            $http.post('/api/pahs/', {})
                .success(function(state) {
                    console.log('new game state: ', state);
                    if (callback) callback(state);
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
            if (numCards <= 0) return;
            // console.log(gameState);
            //var drawInfo = deck.drawCard(gameState.discardedWhite, numCards);

            $http.get('api/pahs/' + gameId + '/draw/' + currentPlayer.info._id + '/' + numCards)
                .success(function(drawnCards) {
                    console.log('these are the cards I drew: ', drawnCards);
                    privatePlayArea.hand = privatePlayArea.hand.concat(drawnCards);
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
                    if (isPlayer) {
                        factoryMethods.draw(10 - hand.length);
                    }
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


        factoryMethods.leave = function() {
            return factoryMethods.deactivatePlayer(currentPlayer.info, true);
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

            factoryMethods.draw(10 - privatePlayArea.hand.length);

            if (currentPlayer.info.isInactive) {
                console.log('REACTIVATING!!!!!')
                factoryMethods.reactivateMe();
            }
            //registerStateSocket();
        }


        function registerStateSocket() {
            socket.socket.on('update', updatePlayArea);
        }

        function updatePlayArea(newState) {
            console.log('updating with: ', newState);
            publicPlayArea.gameState = newState.gameState;
            switch (publicPlayArea.gameState) {
                case 'lobby':
                    updateScoreboard(newState);
                    updatePublicPlayArea(newState);
                    break;
                case 'draw':
                    if (isPlayer) {
                        factoryMethods.draw(10 - privatePlayArea.hand.length);
                    }
                    break;
                case 'play':
                    updateScoreboard(newState);
                    updatePublicPlayArea(newState);
                    break;
                case 'judge':
                    updateScoreboard(newState);
                    updatePublicPlayArea(newState);
                    break;
                case 'winner':
                    updateScoreboard(newState);
                    updatePublicPlayArea(newState);
                    updateWinner(newState);
                    break;
                default:
                    console.log('ERROR: Invalid game state');
                    break;

            }


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

            console.log('MOST RECENT WIN: ', newState.mostRecentWin);


        }

        function updateScoreboard(state) {
            scoreboard.users = state.users;
        }

        function updatePublicPlayArea(state) {
            publicPlayArea.blackCard = state.blackCard;
            publicPlayArea.submittedCards = state.cardsInPlay;
            publicPlayArea.currentJudge = state.users[state.currentJudge] || {};
            publicPlayArea.judgeMode = state.judgeMode;
        }

        function updateWinner(state) {
            publicPlayArea.mostRecentWin = state.mostRecentWin;
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