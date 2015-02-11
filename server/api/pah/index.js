'use strict';

var express = require('express');
var controller = require('./pah.controller');

var router = express.Router();


router.post('/invite',controller.invite);

router.post('/', controller.create);
router.get('/:code', controller.show);
router.post('/:code', controller.join);
router.put('/:id/draw/:user', controller.draw);
router.put('/:id/submit/:user', controller.submit);
router.put('/:id/deactivate/:user', controller.deactivate);
router.put('/:id/reactivate/:user', controller.reactivate);
router.put('/:id/judge', controller.judge);
router.put('/:id/start', controller.startRound);


module.exports = router;