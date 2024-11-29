export {};
const db = require('../config/db');

const Player = db.model('Player', {
    name: String,
    score: Number,
    level: Number
});

module.exports = Player;