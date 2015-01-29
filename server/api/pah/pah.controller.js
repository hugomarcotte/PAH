'use strict';

var _ = require('lodash');
var Pah = require('./pah.model');

// Get list of pahs
exports.index = function(req, res) {
  Pah.find(function (err, pahs) {
    if(err) { return handleError(res, err); }
    return res.json(200, pahs);
  });
};

// Get a single pah
exports.show = function(req, res) {
  Pah.findById(req.params.id, function (err, pah) {
    if(err) { return handleError(res, err); }
    if(!pah) { return res.send(404); }
    return res.json(pah);
  });
};

// Creates a new pah in the DB.
exports.create = function(req, res) {
  Pah.create(req.body, function(err, pah) {
    if(err) { return handleError(res, err); }
    return res.json(201, pah);
  });
};

// Updates an existing pah in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Pah.findById(req.params.id, function (err, pah) {
    if (err) { return handleError(res, err); }
    if(!pah) { return res.send(404); }
    var updated = _.merge(pah, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, pah);
    });
  });
};

// Deletes a pah from the DB.
exports.destroy = function(req, res) {
  Pah.findById(req.params.id, function (err, pah) {
    if(err) { return handleError(res, err); }
    if(!pah) { return res.send(404); }
    pah.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}