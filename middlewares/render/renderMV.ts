/**
 * Render the view with the given name
 */
export {};
const requireOption = require('../requireOption');

function mv(objectrepository: any, viewName: string) {
    return function(req: any, res: any) {
        res.render(viewName);
    };
};

module.exports = mv;