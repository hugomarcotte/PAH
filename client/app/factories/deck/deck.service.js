'use strict';

angular.module('pahApp')
    .factory('deck', function($http) {

        var current_deck = [];

        // Public API here
        return {
            getDeck: getDeck,
            getCurrentDeck: function() {
                return current_deck;
            }
        };

        function getDeck(type, cb) {
            var param = '';
            if (type) param = '/?expansion=' + type;
            $http.get('/api/decks/CAH' + param)
                .success(function(deck) {
                    current_deck = deck;
                    cb(200);
                })
                .error(function(err) {
                    console.log(err);
                    cb(404);
                });
        }

    });
