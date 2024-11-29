/*

- index.ejs -> main game
- login.ejs -> username input
- records.ejs -> records of scores
- about.ejs -> about the game

GET / -> index.ejs, starts the game, if no username is set, redirects to /login
    authMV -> checks if the user is logged in, if not redirects to /login
    renderMV -> renders the page

GET /gameover -> index.ejs, shows the game over screen and saves the score
    authMV -> checks if the user is logged in, if not redirects to /login
    saveMV -> saves the score
    renderMV -> renders the page

POST /api -> makes a post request to openai and returns a new card
    authMV -> checks if the user is logged in, if not redirects to /login
    apiMV -> makes a post request to openai and returns a new card

POST /login -> login.ejs, if username is set, redirects to /, else renders the page
    loginMV -> sets the username, creates a jwt token
    renderMV -> renders the page

GET /records -> records.ejs, shows the records doesn't matter if the user is logged in
    getRecordsMV -> gets the records
    renderMV -> renders the page

GET /about -> about.ejs, shows the about page doesn't matter if the user is logged in
    renderMV -> renders the page

*/

const authMV = require('../middlewares/auth/authMV');
const loginMV = require('../middlewares/auth/loginMV');

const saveMV = require('../middlewares/data/saveMV');
const getRecordsMV = require('../middlewares/data/getRecordsMV');
const apiMV = require('../middlewares/data/apiMV');

const renderMV = require('../middlewares/render/renderMV');

const PlayerModel = require('../models/Player');
const JokerModel = require('../models/Joker');

module.exports = function (app: any) {
    const objRepo = {
        PlayerModel: PlayerModel,
        JokerModel: JokerModel
    };

    app.use('/gameover', saveMV(objRepo), renderMV(objRepo, "gameover"));
    app.use('/api', authMV(objRepo), apiMV());
    app.use('/records', getRecordsMV(objRepo), renderMV(objRepo, "records"));
    app.use('/about', renderMV(objRepo, "about"));
    app.use('/game', authMV(objRepo), renderMV(objRepo, "game"));
    app.use('/', loginMV(objRepo), renderMV(objRepo, "index"));
}