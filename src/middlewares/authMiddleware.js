import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            console.error(error);
            const err = new Error("Not authorized, token failed");
            err.statusCode = 401;
            return next(err);
        }
    }

    if (!token) {
        const err = new Error("Not authorized, no token");
        err.statusCode = 401;
        return next(err);
    }
});



const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            const error = new Error("You do not have permission to perform this action")
            error.statusCode(403);
            throw (error);
        }
        next();
    }
}


export {
    protect,
    restrictTo
}

