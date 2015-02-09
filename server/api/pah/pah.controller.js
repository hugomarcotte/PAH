'use strict';

var _ = require('lodash');
var Pah = require('./pah.model');
var config = require('../../config/environment')
var twilo = require('twilio')(config.twilio.sid, config.twilio.auth);

var decks = {
    master: require('../../decks/cards_against_humanity/master_cards'),
    base: require('../../decks/cards_against_humanity/basedeck')
}

var availableBlackCards = decks.base.black;

function hashUser(name, length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return name + '-' + result;
}

// Get list of pahs
exports.index = function(req, res) {
    Pah.find(function(err, pahs) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, pahs);
    });
};

// Get a single pah
exports.show = function(req, res) {
    Pah.findOne({
        code: req.params.code
    }, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        if (!pah) {
            return res.send(404);
        }
        return res.json(pah);
    });
};

// Creates a new pah in the DB.
exports.create = function(req, res) {
    var pah = new Pah({});
    var id = pah._id.toString();

    pah.code = id.substring(id.length - 4);

    pah.save(function(err, pah) {
        console.log(pah);
        if (err) {
            return handleError(res, err);
        }
        return res.json(pah);
    })
};

exports.join = function(req, res) {
    var code = req.params.code;
    var nameHash = hashUser(req.body.name, 5);

    // var regex = new RegExp(code + '$', 'i');
    Pah
        .findOne({
            code: code
        })
        .exec(function(err, game) {
            if (!game) {
                res.send(404);
            }
            if (err) {
                console.log(err);
                return handleError(res, err);
            }
            console.log(game);
            if (code === game.code) {
                console.log('FOUND GAME', game);

                var isJudge = game.users.length === 0 ? true : false;
                var player = {
                    name: req.body.name,
                    _id: nameHash,
                    score: 0,
                    cards: [],
                    icon: '',
                    isJudge: isJudge
                }

                var index = game.users.push(player) - 1;
                game.users[index].index = index;
                game.save(function(err, game) {
                    console.log('SAVED GAME', game);
                    if (err) {
                        return handleError(res, err);
                    }
                    return res.json({
                        state: game,
                        playerId: player._id
                    });
                })
            }
        })
};

exports.draw = function(req, res) {
    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        console.log('we drew: ', req.body.cardsWeDrew);
        pah.discardedWhite = pah.discardedWhite.concat(req.body.cardsWeDrew);
        pah.users.forEach(function(user) {
            if (user._id === req.params.user) {
                // req.body.cardsWeDrew.forEach(function(newCard) {
                //     user.cards.push(newCard)
                // })
                user.cards = user.cards.concat(req.body.cardsWeDrew);
            }
        })
        pah.currentDrawingUser++;
        if (pah.currentDrawingUser == pah.users.length) {
            pah.currentDrawingUser = -1;
        }
        console.log('current drawing user: ', pah.currentDrawingUser);
        pah.markModified('users');
        pah.save(function(err, pah) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200);
        })
    })
};

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

exports.submit = function(req, res) {
    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        var cards = req.body.cards;
        console.log("THESE ARE CARDS", cards);
        //cards.userId = req.params.user;
        pah.cardsInPlay.push(cards);
        if (pah.cardsInPlay.length >= pah.users.length - 1) {
            pah.judgeMode = true;
            pah.cardsInPlay = shuffle(pah.cardsInPlay);
            console.log("cards in play", pah.cardsInPlay.length)
        }
        pah.users.forEach(function(user) {
            var userHand = user.cards
            if (user._id === req.params.user) {
                cards.forEach(function(card) {
                    userHand.splice(userHand.indexOf(card.id), 1)
                    card.userId = req.params.user;
                })
            }
        })
        pah.markModified('users');
        pah.save(function(err, pah) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200);
        })
    })
};

exports.judge = function(req, res) {
    var winning_cards = req.body.cards;
    var winning_user = winning_cards[0].userId;


    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        console.log(pah);

        pah.mostRecentWin = winning_cards;
        // pah.mostRecentBlack = pah.blackCard;


        //MAYBE MARK MODIFIED.
        pah.users.forEach(function(user) {
            if (user._id === winning_user) {
                console.log('WINNING USER', user);
                user.score += 1000;
            }
        })
        pah.users[pah.currentJudge].isJudge = false;
        pah.currentJudge++;
        if (pah.currentJudge === pah.users.length) pah.currentJudge = 0;
        pah.users[pah.currentJudge].isJudge = true;
        pah.markModified('users')
        pah.save(function(err, pah) {
            console.log(pah);
            if (err) {
                return handleError(res, err);
            }
            return res.json(200);
        })
    })
};

// Updates an existing pah in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        if (!pah) {
            return res.send(404);
        }
        var updated = _.merge(pah, req.body);
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, pah);
        });
    });
};

// Deletes a pah from the DB.
exports.destroy = function(req, res) {
    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        if (!pah) {
            return res.send(404);
        }
        pah.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

exports.invite = function(req, res) {
    console.log(req.body);
    var number = '+1' + req.body.phoneNumber;
    var link = req.body.link;
    // var link = 'http://192.168.1.15:9000/pah/e586';

    //Send an SMS text message
    twilo.sendMessage({

        to: number, // Any number Twilio can deliver to
        from: '+19178096527', // A number you bought from Twilio and can use for outbound communication
        body: 'You\'ve been summoned for a game of Phones Against Humanity! Click to join lobby: ' + link // body of the SMS message

    }, function(err, responseData) { //this function is executed when a response is received from Twilio
        console.log(arguments);
        if (err) {
            return handleError(res, err);
        }
        // "err" is an error received during the request, if any

        // "responseData" is a JavaScript object containing data received from Twilio.
        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.body); // outputs "word to your mother."
        res.send(200);
    });
};

exports.startRound = function(req, res) {

    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        if (!pah) {
            return res.send(404);
        }

        pah.mostRecentWin = [];

        // console.log(pah.discardedBlack);
        //console.log(Math.floor(Math.random()*availableBlackCards.length));
        pah.blackCard = availableBlackCards[Math.floor(Math.random() * availableBlackCards.length)];
        while (pah.discardedBlack.indexOf(pah.blackCard.id) >= 0) {
            //console.log(Math.floor(Math.random()*availableBlackCards.length));
            pah.blackCard = availableBlackCards[Math.floor(Math.random() * availableBlackCards.length)];
        }
        pah.discardedBlack.push(pah.blackCard.id);

        pah.currentDrawingUser = 0;
        pah.cardsInPlay = [];
        pah.judgeMode = false;
        pah.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}
