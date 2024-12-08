/**
 * Save middleware
 */
export {};
const requireOption = require('../requireOption');

function mv(objectrepository: any) {
    const PlayerModel = requireOption(objectrepository, 'PlayerModel');

    return async function(req: any, res: any, next: any) {
        if (!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('score') || !req.body.hasOwnProperty('level')) {
            return res.redirect('/');
        }
        
        res.locals.player = new PlayerModel();
        res.locals.player.name = req.body.name;
        res.locals.player.score = req.body.score;
        res.locals.player.level = req.body.level;

        await res.locals.player.save().then(() => {
            return next();
        }).catch((err: any) => {
            return next(err);
        });
    };
};

module.exports = mv;