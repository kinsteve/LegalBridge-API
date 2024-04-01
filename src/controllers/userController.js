import asyncHandler from  'express-async-handler';
import User from '../models/User.js';
import LSP from '../models/LSP.js';
import Booking from '../models/Booking.js';


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
      return res.status(200).json(nearestLSPs);
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