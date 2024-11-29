/**
 * Get all records from the database
 */
export {};
const requireOption = require('../requireOption');

function mv(objectrepository: any) {
    const PlayerModel = requireOption(objectrepository, 'PlayerModel');

    return async function(req: any, res: any, next: any) {
        await PlayerModel.find({}).then((players: any) => {
            res.locals.players = players;
            return next();
        }).catch((err: any) => {
            console.log(err);
        });
    };
};

module.exports = mv;