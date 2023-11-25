import asyncHandler from  'express-async-handler';

const profile = asyncHandler(async(req,res)=>{

    const user = req.user; 
    res.status(200).json(user);
})
const updateUser = async(req,res)=>{
    try {
        const updateDetails = req.body;
        const user = req.user;
        console.log(user);
        if (Object.keys(updateDetails).length === 0 || !updateDetails.password) {
          return res.status(400).json({ message: "Please provide data to update" });
        }
        Object.assign(user, updateDetails);
        await user.save({ validateBeforeSave: false });
    
        return res.status(200).json({user, message: "User details updated successfully" });
      } catch (error) {
        return res.status(500).json({ message:error });
      }

}

export {
    profile,
    updateUser
}