import asyncHandler from  'express-async-handler';
import User from '../models/User.js';


const profile = asyncHandler(async(req,res)=>{

    const user = req.user; 
    res.status(200).json(user);
})
const updateUserDetails = asyncHandler(async (req, res) => {
    const { id } = req.params; 
    const updates = req.body; 
    if ('password' in updates) {
      delete updates.password;
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, {
        new: true,
        runValidators: true, 
      });
      console.log(updatedUser);
      if (!updatedUser) {
        res.status(404);
        throw new Error("User not Found");
      }

      res.status(200).json({updatedUser , message:"Details are saved successfully!"});
    } catch (error) {
      res.status(500);
      console.log(error);
      throw new Error("There is an error while updating the user details",error);
    }
  });
  

export {
    profile,
    updateUserDetails
}