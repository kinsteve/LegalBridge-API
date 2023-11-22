

import asyncHandler from  'express-async-handler';

const profile = asyncHandler(async(req,res)=>{

     const user = req.user; 
    res.json(user);
})

export {
    profile,
}