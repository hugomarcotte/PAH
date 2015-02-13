'use strict';

var _ = require('lodash');
var Gif = require('./gif.model');
var request = require('request');


exports.buildGifs = function (req, res) {
  console.log("got here!");
  var gifs = {};
  request('http://api.giphy.com/v1/gifs/search?q=waiting&api_key=dc6zaTOxFJmzC&limit=10', function (error, response, body) {
    if (!error && response.statusCode == 200) { 
      var waitingGifsJSON = JSON.parse(body).data;
      var waitingGifsArray = [];
      waitingGifsJSON.forEach(function(gifObj){
        waitingGifsArray.push(gifObj.images.original.url);
      });
      gifs.waitingGifs = waitingGifsArray;
     request('http://api.giphy.com/v1/gifs/search?q=judge&api_key=dc6zaTOxFJmzC&limit=10', function (error, response, body) {
        if (!error && response.statusCode == 200) { 
        var judgeGifsJSON = JSON.parse(body).data;
        var judgeGifsArray = [];
        judgeGifsJSON.forEach(function(gifObj){
          judgeGifsArray.push(gifObj.images.original.url);
        });
        gifs.judgeGifs = judgeGifsArray;
        // console.log(gifs);
        return res.json(200, {gifs: gifs});
      }
     })
    }
  });
};

// Get list of gifs
exports.index = function(req, res) {
  Gif.find(function (err, gifs) {
    if(err) { return handleError(res, err); }
    return res.json(200, gifs);
  });
};

// Get a single gif
exports.show = function(req, res) {
  Gif.findById(req.params.id, function (err, gif) {
    if(err) { return handleError(res, err); }
    if(!gif) { return res.send(404); }
    return res.json(gif);
  });
};

// Creates a new gif in the DB.
exports.create = function(req, res) {
  Gif.create(req.body, function(err, gif) {
    if(err) { return handleError(res, err); }
    return res.json(201, gif);
  });
};

// Updates an existing gif in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Gif.findById(req.params.id, function (err, gif) {
    if (err) { return handleError(res, err); }
    if(!gif) { return res.send(404); }
    var updated = _.merge(gif, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, gif);
    });
  });
};

// Deletes a gif from the DB.
exports.destroy = function(req, res) {
  Gif.findById(req.params.id, function (err, gif) {
    if(err) { return handleError(res, err); }
    if(!gif) { return res.send(404); }
    gif.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}