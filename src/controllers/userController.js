import asyncHandler from  'express-async-handler';
import User from '../models/User.js';
import LSP from '../models/LSP.js';
import Booking from '../models/Booking.js';


const profile = asyncHandler(async(req,res)=>{
    const user = req.user; 
    res.status(200).json(user);
})

function isValidTimeSlot(selectedTimeString, startTimeString, endTimeString) {
  console.log(selectedTimeString)
  console.log(startTimeString);
  console.log(endTimeString);
  const selectedTime = new Date(selectedTimeString);
  // const startTime = new Date(startTimeString);
  // const endTime = new Date(endTimeString);
  console.log(selectedTime);
  // console.log(startTime);
  // console.log(endTime);
  if (selectedTime >= startTime && selectedTime <= endTime) {
    console.log("Selected time is within the LSP's availability.");
    return false;
  }
  return true;
}

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

      res.status(200).json({...updatedUser._doc, message:"Details are saved successfully!"});
    } catch (error) {
      res.status(500);
      console.log(error);
      throw new Error("There is an error while updating the user details",error);
    }
  });

  const bookingSlot = asyncHandler(async(req,res)=>{
    try {
      const { userId, lspId, appointmentDate, selectedTime } = req.body;
      const user = await User.findById(userId);
      if (!user) {
          res.status(404)
          throw new Error("User not found!!");
      }
      const lsp = await LSP.findById(lspId);
      if (!lsp) {
          res.status(404)
          throw new Error("LSP not found!!");
      }

      if (isValidTimeSlot(selectedTime, lsp.startTime, lsp.endTime)) {
         
        // res.status(400)
          // throw new Error("Invalid time slot selected");
      }
      const booking = await Booking.create({
          userId,
          lspId,
          appointmentDate,
          selectedTime,
      });

      res.status(201).json({...booking._doc,message:"Slot booked successfully"});
  } catch (error) {
      res.status(500)
      throw new Error("Internal Server Errror",error.message);
  }
  })
  

  const findNearestLSPsToUser = asyncHandler(async(req,res,next)=>{
    const { clientCoordinates } = req.body;
    try {
      const nearestLSPs = await LSP.find({
        geoLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: clientCoordinates
            },
            $maxDistance: 500000 // Adjust max distance as needed
          }
        }
      });
  
      // Send the nearestLSPs as a response
      return res.status(200).json({ nearestLSPs });
    } catch (error) {
      return next(error);
    }
})

export {
    profile,
    updateUserDetails,
    bookingSlot,
    findNearestLSPsToUser
}