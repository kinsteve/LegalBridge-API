import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

const protect  = asyncHandler(async(req,res,next)=>{
    let token;

    if(req.headers.authorization && 
        req.headers.authorization.startsWith("Bearer"))  //if it is true than it means we have the token
    {
        try{
             token = req.headers.authorization.split(" ")[1];    
             /* token will look like this
                Bearer mmkmewiowejrefw
                So we split at " " than we choose [1] from [0],[1]
             */
            //decodes the token id
            const decoded = await jwt.verify(token , process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        }catch(error){
            res.status(401);
            throw new Error("Not authorized , token failed");
        }
    }

    if(!token){
        res.status(401);
        throw new Error("Not authorized , no token");
    }
});


const restrictTo =  (...roles)=>{
        return (req,res,next)=>{
            if (!roles.includes(req.user.role)) {
                 res.status(403);
                   throw new Error("You do not have permission to perform this action");         
                }
            next();
        }
    }


export {
    protect,
    restrictTo
}

