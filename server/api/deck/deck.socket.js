/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Deck = require('./deck.model');

exports.register = function(socket) {
  Deck.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Deck.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('deck:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('deck:remove', doc);
}