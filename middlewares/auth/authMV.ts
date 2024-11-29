import jsonwebtoken from 'jsonwebtoken';
export {};
const requireOption = require('../requireOption');

function mv(objectrepository: any) {
    return function(req: any, res: any, next: any) {
        try {
            if (!req.cookies.hasOwnProperty('token'))
                return res.redirect("/");
            const token = req.cookies.token;

            const key: string = process.env.LOGIN_KEY || "";
            if (key === "")
                return next(new Error("Key not found"));

            const username = jsonwebtoken.verify(token, key).username;
            res.locals.username = username;
            next();
        } catch (err) {
            return next(err);
        }
    };
};

module.exports = mv;