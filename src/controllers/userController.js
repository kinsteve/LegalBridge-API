import asyncHandler from  'express-async-handler';
import User from '../models/User.js';


const profile = asyncHandler(async(req,res)=>{

    const user = req.user; 
    res.status(200).json(user);
})
const updateUserDetails = async (req, res) => {
    const { id } = req.params; 
    const updates = req.body; 
    
    try {
      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true, 
      });
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      await  updatedUser.save();
      res.status(200).json({message:"Details are saved successfully!"});
    } catch (error) {
      res.status(500).json({ message: 'There is an error while updating the user details' });
    }
  };
  

export {
    profile,
    updateUserDetails
}