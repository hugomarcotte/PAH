/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Gif = require('./gif.model');

exports.register = function(socket) {
  Gif.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Gif.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('gif:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('gif:remove', doc);
}