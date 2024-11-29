import jsonwebtoken from 'jsonwebtoken';
export {};
const requireOption = require('../requireOption');

function mv(objectrepository: any) {
    return async function(req: any, res: any, next: any) {
        try {
            if (!req.body.hasOwnProperty('username')) {
                return next();
            }
            const username = req.body.username;
            const key: string = process.env.LOGIN_KEY || "";
            if (key === "")
                return next(new Error("Key not found"));

            const token = jsonwebtoken.sign({ username }, key, { expiresIn: "1h" });
            res.cookie("token", token, {
                httpOnly: true,
            });
            res.redirect('/game');
        } catch (error) {
            return next(error);
        }
    };
};

module.exports = mv;