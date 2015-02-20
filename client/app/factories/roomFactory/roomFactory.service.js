'use strict';

angular.module('pahApp')
  .factory('roomFactory', function($http, $cookies, socket) {
    var roomMethods = {};
    var currentGameCode;
    var currentGameId;
    var gameState;

    roomMethods.spectate = function(path, gameCode, joinHelper, callback) {
      currentGameCode = gameCode;
      return $http.get('/api/' + path + 's/' + gameCode)
        .success(function(state) {
          gameState = state;
          currentGameId = state._id;
          socket.socket.emit('join', path + '/' + state._id);
          if (callback) callback(state);
          rejoin(joinHelper);
        })
        .error(function(err) {
          console.log('Failed to spectate game: ', err);
        })
    };

    roomMethods.join = function(path, name) {
      return $http.post('/api/' + path + 's/' + currentGameCode, {
          name: name
        })
        .success(function(data) {
          setCookie(data.playerId);
        })
    };

    function rejoin(joinHelper) {
      var playerId = getCookie();
      if (!playerId) return undefined;
      joinHelper({
        state: gameState,
        playerId: playerId
      });
    };

    roomMethods.deactivatePlayer = function(path, player, leaving) {
      if (player.isInactive && !leaving) return;
      return $http.put('/api/' + path + 's/' + currentGameId + '/deactivate/' + player._id + '', {
          hasLeft: leaving
        });
    };

    roomMethods.reactivatePlayer = function(path, player) {
      if (!player.isInactive) return;
      return $http.put('/api/' + path + 's/' + currentGameId + '/reactivate/' + player._id, {});
    };

    return roomMethods;

    function setCookie(userId) {
      if ($cookies.games) {
        var cookies = JSON.parse($cookies.games);
        cookies.push({
          gameCode: currentGameCode,
          userId: userId
        });
        $cookies.games = JSON.stringify(cookies);
      } else {
        $cookies.games = JSON.stringify([{
          gameCode: currentGameCode,
          userId: userId
        }]);
      }
    }

    function getCookie() {
      if (!$cookies.games) {
        return undefined;
      }

      var cookies = JSON.parse($cookies.games);
      var playerId;
      cookies.forEach(function(game) {
        if (currentGameCode === game.gameCode) {
          playerId = game.userId;
        }
      })
      return playerId;
    }



  });