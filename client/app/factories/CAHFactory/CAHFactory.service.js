'use strict';

angular.module('pahApp')
  .factory('CAHFactory', function($http, deck, $cookies, socket) {
    var gameId = '';
    var factoryMethods = {};
    var gameState;
    var currentPlayer = {
      info: {},
      index: -1
    };
    var privatePlayArea = {
      hand: []
    }
    var publicPlayArea = {
      blackCard: {},
      submittedCards: [],
      judgeMode: false,
      currentJudge: {}
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

    factoryMethods.getCurrentPlayer = function(joinCode) {
      if (gameState) return currentPlayer;
      this.rejoin(joinCode);
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
            self.spectate(state.code, callback);
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

    factoryMethods.draw = function(cardsWeDrew, gameId) {
      $http.put('api/pahs/' + gameId + '/draw/', {
        cardsWeDrew: cardsWeDrew
      }).success(function(data) {
        console.log(data);
      });
    };

    factoryMethods.play = function(card, userId) {
      console.log('you just played card number: ', card);
      $http.put('/api/pahs/' + gameId + '/submit/' + userId + '', {
          card: card
        })
        .success(function(data) {
          console.log('Played card', card);
        })
        .error(function(err) {
          console.log('Failed to join game: ', err);
        });
      return;
    };

    factoryMethods.judge = function(card) {
      console.log('the player who played card ', card, ' is the winner!');
      $http.put('/api/pahs/' + gameId + '/judge/', {
          card_id: card._id,
          user_id: card.userId
        })
        .success(function(data) {
          console.log('Judged this card as the winner:', card);
        })
        .error(function(err) {
          console.log('Failed to join game: ', err);
        });
      return;
    };

    factoryMethods.spectate = function(joinCode, callback) {
      if (!joinCode) {} // Do some stuff if you were the one to init
      isPlayer = false;
      $http.get('/api/pahs/' + joinCode)
        .success(function(data) {
          if (callback) callback(data);
        })
    };

    factoryMethods.join = function(name, joinCode, callback) {
      //console.log(arguments);
      if (!joinCode) {} // Do some stuff if you were the one to init

      // check the cookie to see whether we rejoin or not
      if (this.rejoin(joinCode)) {
        console.log('rejoining...');
        if (callback) return callback(joinCode);
        return;
      }
      $http.post('/api/pahs/' + joinCode, {
          'name': name
        })
        .success(function(data) {
          if (callback) callback(data);

          joinHelper(data);
          // Set the cookie for this player
          $cookies.games = JSON.stringify([{
            gameCode: joinCode,
            userId: currentPlayer.info._id
          }]);
          if (callback) callback(joinCode);
        })
        .error(function(err) {
          console.log('Failed to join game: ', err);
        });
    };

    function joinHelper(data) {
      gameId = data.state._id;
      updatePlayArea(data.state);

      gameState.users.forEach(function(user, index) {
        if (user._id == data.playerId) {
          currentPlayer.index = index;
          currentPlayer.info = user;
        }
      })

      privatePlayArea.hand = [];
      registerStateSocket();
    }

    // this shouldn't be externally facing,
    // should just get called when join finds that
    // you're already in the game
    factoryMethods.rejoin = function(joinCode) {
      if (!$cookies.games) return false;

      /// parse it check it push it stringify it reset it
      var cookies = JSON.parse($cookies.games);
      var playerId;
      cookies.forEach(function(game) {
        if (joinCode === game.gameCode) {
          playerId = game.userId;
        }
      })
      if (!playerId) return false;

      this.getGameByCode(joinCode, function(state) {
        joinHelper({
          state: state,
          playerId: playerId
        });
      });
      return true;
    };

    function registerStateSocket() {
      socket.socket.on('pah:' + gameId, updatePlayArea);
    }

    function updatePlayArea(newState) {
      console.log(newState);
      gameState = newState;
      currentPlayer.info = newState.users[currentPlayer.index];
      publicPlayArea.blackCard = newState.blackCard;
      publicPlayArea.submittedCards = newState.cardsInPlay;
      publicPlayArea.currentJudge = newState.users[newState.currentJudge];
      scoreboard.users = newState.users;
    }


    // Public API here
    return factoryMethods;
  });