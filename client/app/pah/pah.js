'use strict';

angular.module('pahApp')
	.config(function($stateProvider) {
		$stateProvider
			.state('pah', {
				url: '/pah/:code',
				templateUrl: 'app/pah/pah.html',
				controller: 'PahCtrl',
				resolve: {
					resolveDeck: function(deck) {
						// get the promise
						console.log('Using the demo deck');
						return deck.getDeck('demo');
					},
					resolveState: function(CAHFactory, $stateParams) {
						return CAHFactory.spectate($stateParams.code);
					}
				}
			});
	});