import asyncHandler from  'express-async-handler';
import User from '../models/User.js';
import LSP from '../models/LSP.js';
import LSPModel from '../models/LSP.js';
import UserModel from '../models/User.js';


const profile = asyncHandler(async (req, res, next) => {
  try {
      if (!req.user) {
          const error = new Error("User not found");
          error.statusCode = 404; // Status code for resource not found
          throw error;
      }
      const user = req.user;
      res.status(200).json(user);
  } catch (error) {
      return next(error);
  }
});

// function isValidTimeSlot(selectedTimeString, startTimeString, endTimeString) {
//   console.log(selectedTimeString)
//   console.log(startTimeString);
//   console.log(endTimeString);
//   const selectedTime = new Date(selectedTimeString);
//   // const startTime = new Date(startTimeString);
//   // const endTime = new Date(endTimeString);
//   console.log(selectedTime);
//   // console.log(startTime);
//   // console.log(endTime);
//   if (selectedTime >= startTime && selectedTime <= endTime) {
//     console.log("Selected time is within the LSP's availability.");
//     return false;
//   }
//   return true;
// }

const updateUserDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  if ('password' in updates) {
      delete updates.password;
  }

  try {
      const existingUser = await User.findOne({
          $or: [{ email: updates.email }, { voterId: updates.voterId }],
          _id: { $ne: id } // Exclude the current user from the search
      });

      if (existingUser) {
          const field = existingUser.email === updates.email ? "Email" : "VoterId";
          const message = `${field} is already associated with some other account`;
          const error = new Error(message);
          error.statusCode = 400; // Bad Request
          throw(error);
      }

      const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, {
          new: true,
          runValidators: true,
      });

      if (!updatedUser) {
          const error = new Error('User not found');
          error.statusCode = 404; // Not Found
          throw(error);
      }

      res.status(200).json({ ...updatedUser._doc, message: "Details are saved successfully!" });
  } catch (error) {
     return next(error);
  }
});


  const bookingSlot = asyncHandler(async(req,res,next)=>{
    try {
      const { lspId, slotId } = req.params;
      const { userId } = req.body;
  
      const lsp = await LSPModel.findById(lspId);
      if (!lsp)
      {
        const error= new Error('LSP not found');
        error.statusCode= 404;
        throw(error);
      }
      const slot = lsp.slots.map(slotArray => slotArray.find(slot => slot._id.toString() === slotId)).find(Boolean);
      if (!slot || slot.isBooked) 
        {
          const error= new Error('Slot is already booked');
          error.statusCode=404;
          throw(error);
        }
      
      slot.isBooked = true;
      await lsp.save({validateBeforeSave: false});
  
      const user = await UserModel.findById(userId);
      if (user) {
        user.bookedSlots = user.bookedSlots || [];
        user.bookedSlots.push({ lspId: lspId, slot: slotId });
        await user.save({validateBeforeSave: false});
      }
  
      res.status(200).json({message: 'Slot booked successfully'});
    } catch (error) {
      return next(error);
    }
  })

  const findBookedSlots=asyncHandler(async(req,res,next)=>{
    try {
      const { userId } = req.params;
      const user = await UserModel.findById(userId).populate({path:'bookedSlots.lspId',model:LSPModel});
      // const user = await UserModel.findById(userId)
      if (!user) 
      {
        const error= new Error('User not found');
        error.statusCode(404);
        throw(error);
      }
      res.status(200).json(user.bookedSlots);
    } catch (error) {
      return next(error);
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
      return res.status(200).json(nearestLSPs);
    } catch (error) {
      return next(error);
    }
})

export {
    profile,
    updateUserDetails,
    bookingSlot,
    findNearestLSPsToUser,
    findBookedSlots
}