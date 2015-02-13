/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Pah = require('./pah.model');

exports.register = function(socket) {
	Pah.schema.post('save', function(doc) {
		onSave(socket, doc);
	});
	Pah.schema.post('remove', function(doc) { 
		onRemove(socket, doc);
	});
}

function onSave(socket, doc, cb) {
	//console.log(doc);
	console.log('FROM SOCKET', doc._id);
	socket.to('pah/' + doc._id).emit('update', doc);
	// socket.emit('pah:' + doc._id, doc);
}

function onRemove(socket, doc, cb) {
	// socket.emit('pah:' + doc._id, doc);
}