import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import UserModel from '../models/User.js';
import LSPModel from '../models/LSP.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Decode the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if the token belongs to a user or an LSP
            const user = await UserModel.findById(decoded.id).select("-password");
            const lsp = await LSPModel.findById(decoded.id).select("-password");

            if (user) {
                req.user = user;
            } else if (lsp) {
                req.user = lsp;
            } else {
                const err = new Error("Not authorized, token failed");
                err.statusCode = 401;
                return next(err);
            }

            next();
        } catch (error) {
            console.error(error);
            const err = new Error("Not authorized, token failed");
            err.statusCode = 401;
            return next(err);
        }
    } else {
        const err = new Error("Not authorized, no token");
        err.statusCode = 401;
        return next(err);
    }
});


const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            console.log(roles);
            console.log(req.user);
            const error = new Error("You do not have permission to perform this action")
            error.statusCode=403;
            throw (error);
        }
        next();
    }
}


export {
    protect,
    restrictTo
}

