'use strict';

var _ = require('lodash');
var Pah = require('./pah.model');
var config = require('../../config/environment')
var twilo = require('twilio')(config.twilio.sid, config.twilio.auth);

var decks = {
    master: require('../../decks/cards_against_humanity/master_cards'),
    base: require('../../decks/cards_against_humanity/basedeck'),
    demo: require('../../decks/cards_against_humanity/demodeck')
}

var availableBlackCards = decks.demo.black;
var availableWhiteCards = decks.demo.white;

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
        code: req.params.code.toLowerCase()
    }, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        if (!pah) {
            return res.send(404);
        }
        return res.json(200, pah);
    });
};

// Creates a new pah in the DB.
exports.create = function(req, res) {
    var pah = new Pah({});
    var id = pah._id.toString();
    shuffle(availableBlackCards);
    shuffle(availableWhiteCards);

    // makes array of element ids
    pah.availableWhite = availableWhiteCards.map(function(el) {
        return el.id;
    });

    pah.code = id.substring(id.length - 4);
    pah.gameState = 'lobby';

    pah.save(function(err, pah) {
        //console.log(pah);
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
            // console.log('FOUND GAME', game);

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
            game.numActivePlayers++;

            game.users[index].index = index;
            game.save(function(err, game) {
                // console.log('SAVED GAME', game);
                if (err) {
                    return handleError(res, err);
                }
                return res.json({
                    state: game,
                    playerId: player._id
                });
            })

        })
};

exports.draw = function(req, res) {
    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        var num = req.params.numCards;
        var drawnCards = [];
        while (num > 0) {
            drawnCards.push(pah.availableWhite.pop());
            num--;
        }
        // console.log('we drew: ', req.body.cardsWeDrew);
        pah.discardedWhite = pah.discardedWhite.concat(drawnCards);
        pah.users.forEach(function(user) {
            if (user._id === req.params.user) {
                // req.body.cardsWeDrew.forEach(function(newCard) {
                //     user.cards.push(newCard)
                // })
                if (user.cards.length >= 10) return res.json(400);
                user.cards = user.cards.concat(drawnCards);
            }
        })

        if (pah.gameState === 'draw') {
            pah.gameState = 'play';
        }

        var retCards = availableWhiteCards.filter(function(el) {
            return (drawnCards.indexOf(el.id) > -1);
        })

        // pah.currentDrawingUser++;
        // if (pah.currentDrawingUser == pah.users.length) {
        //     console.log('current drawing user: ', pah.currentDrawingUser);

        //     pah.currentDrawingUser = -1;
        // }
        pah.markModified('users');
        pah.save(function(err, pah) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, retCards);
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
        // console.log("THESE ARE CARDS", cards);
        //cards.userId = req.params.user;
        pah.cardsInPlay.push(cards);

        pah.users.forEach(function(user) {
            var userHand = user.cards
            if (user._id === req.params.user) {
                user.hasSubmitted = true;
                cards.forEach(function(card) {
                    userHand.splice(userHand.indexOf(card.id), 1)
                    card.userId = req.params.user;
                })
            }
        })
        if (allActiveSubmissions(pah)) {
            pah.judgeMode = true;
            pah.gameState = 'judge';
            pah.cardsInPlay = shuffle(pah.cardsInPlay);
            // console.log("cards in play", pah.cardsInPlay.length)
            setJudgeTimeout(req.params.id, pah.currentRound, pah.users[pah.currentJudge].isInactive, pah.currentJudge);
        }
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
    if (!winning_cards.length) return handleError(res);
    var winning_user = winning_cards[0].userId;


    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        // console.log(pah);

        pah.mostRecentWin = winning_cards;
        pah.gameState = 'winner';
        // pah.mostRecentBlack = pah.blackCard;


        //MAYBE MARK MODIFIED.
        pah.users.forEach(function(user) {
            if (user._id === winning_user) {
                console.log('WINNING USER', user);
                user.score += 1000;
            }
        })

        setNextJudge(pah);

        pah.markModified('users')
        pah.save(function(err, pah) {
            // console.log(pah);
            if (err) {
                return handleError(res, err);
            }
            return res.json(200);
        })
    })
};

exports.deactivate = function(req, res) {

    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        if (!pah) return res.json(400);

        var userId = req.params.user;
        var currentUser;

        //MAYBE MARK MODIFIED.
        pah.users.forEach(function(user, index) {
            if (user._id === userId) {
                currentUser = user;
                if (!user.isInactive) {
                    user.isInactive = true;
                    pah.numActivePlayers--;
                }
                user.hasLeft = req.body.hasLeft;
                // if (index === pah.currentJudge && user.cards.length < 10) {
                //     setNextJudge(pah);
                // }
            }
        })

        // IF THE JUDGE LEFT WE HAVE TO DO SOME STUFF
        // like set next judge
        // pah.mostRecentWin = pah.cardsInPlay[Math.floor(Math.random() * pah.cardsInPlay.length)];
        //            if (!pah.mostRecentWin) return;
        //            pah.users.forEach(function(user) {

        //                if (pah.mostRecentWin[0] && user._id === pah.mostRecentWin[0].userId) {
        //                    console.log('WINNING USER', user);
        //                    user.score += 1000;
        //                }
        //            })

        if (currentUser.isJudge) {
            if (pah.judgeMode) {
                autoJudge(pah);
            } else {
                // check if the round has started
                if (currentUser.cards.length < 10) {
                    setNextJudge(pah);
                }
            }
        }


        if (pah.gameState === 'play') {
            if (allActiveSubmissions(pah)) {
                pah.judgeMode = true;
                pah.gameState = 'judge';
                pah.cardsInPlay = shuffle(pah.cardsInPlay);
                setJudgeTimeout(req.params.id, pah.currentRound, pah.users[pah.currentJudge].isInactive, pah.currentJudge);
                console.log("cards in play", pah.cardsInPlay.length)
            }
        }
        console.log('deactivating ', userId);
        console.log(pah.numActivePlayers);
        pah.markModified('users')
        pah.save(function(err, pah) {
            // console.log(pah);
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, pah);
        })
    })
};
exports.reactivate = function(req, res) {

    Pah.findById(req.params.id, function(err, pah) {
        if (err) {
            return handleError(res, err);
        }
        var userId = req.params.user;

        // console.log('reactivating?', pah)
        //MAYBE MARK MODIFIED.
        pah.users.forEach(function(user) {
            if (user._id === userId) {
                if (user.isInactive) {
                    user.isInactive = false;
                    user.hasLeft = false;
                    pah.numActivePlayers++;
                }
            }
        })
        console.log('reactivating ', userId);
        console.log(pah.numActivePlayers);
        pah.markModified('users')
        pah.save(function(err, pah) {
            // console.log(pah);
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, pah);
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
        var counter = 0;
        do {
            //console.log(Math.floor(Math.random()*availableBlackCards.length));
            pah.blackCard = availableBlackCards[Math.floor(Math.random() * availableBlackCards.length)];
            counter++;
            if (counter > 25) {
                pah.discardedBlack = [];
                shuffle(availableBlackCards);
            }
        } while (pah.discardedBlack.indexOf(pah.blackCard.id) >= 0)
        pah.discardedBlack.push(pah.blackCard.id);

        pah.gameState = 'play';
        pah.cardsInPlay = [];
        pah.judgeMode = false;
        pah.currentRound++;

        pah.users.forEach(function(user) {
            user.hasSubmitted = false;
            if (user.isJudge) user.hasSubmitted = true;
        })
        pah.markModified('users')
        pah.save(function(err) {

            if (err) {
                return handleError(res, err);
            }
            return res.json(200);
        });
    });
};

function setJudgeTimeout(id, round, inactiveJudge, judgeIndex) {
    var time = (inactiveJudge ? 30000 : 90000);
    console.log('timeout time: ', time);
    setTimeout(function() {
        console.log('JUDGE TIMED OUT');
        Pah.findById(id, function(err, pah) {
            if (pah.currentRound !== round || !pah.judgeMode) return;
            if (inactiveJudge && pah.users[judgeIndex].isInactive) autoJudge(pah);
            pah.users[pah.currentJudge].hasSubmitted = false;
            // setNextJudge(pah);
            pah.markModified('users')
            pah.save(function(err, pah) {});

        });
    }, time);
}

function setNextJudge(pah) {
    pah.users[pah.currentJudge].isJudge = false;
    var oldJudge = pah.currentJudge;
    do {
        pah.currentJudge++;
        if (pah.currentJudge === pah.users.length) pah.currentJudge = 0;
        if (oldJudge == pah.currentJudge) {
            break;
        }
    } while (pah.users[pah.currentJudge].isInactive);

    pah.users[pah.currentJudge].isJudge = true;
}

function allActiveSubmissions(pah) {
    var allSubmit = true;
    pah.users.forEach(function(player) {
        if (!player.isInactive && !player.hasSubmitted) {
            if (player.isJudge) return;
            allSubmit = false;
        }
    })
    return allSubmit;
}

function autoJudge(pah) {
    pah.mostRecentWin = pah.cardsInPlay[Math.floor(Math.random() * pah.cardsInPlay.length)];
    if (!pah.mostRecentWin) return;
    pah.users.forEach(function(user) {

        if (pah.mostRecentWin[0] && user._id === pah.mostRecentWin[0].userId) {
            console.log('WINNING USER', user);
            user.score += 1000;
        }
    })
    setNextJudge(pah);
}

function handleError(res, err) {
    console.log(err);
    return res.send(500, err);
}