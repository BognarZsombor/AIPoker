export {};
const Schema = require('mongoose').Schema;
const db = require('../config/db');

const Joker = db.model('Joker', {
    name: String,
    desc: String,
    _player: {
        type: Schema.Types.ObjectId,
        ref: 'Player'
    }
});

module.exports = Joker;