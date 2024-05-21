import asyncHandler from "express-async-handler";
import LSPModel from "../models/LSP.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from "moment-timezone";
import UserModel from "../models/User.js";

// import '../../lspData.json'assert { type: 'json' };
// const lspsData = require('./lspsData.json');


const getAllDetails = asyncHandler(async (req, res, next) => {
  try {
      const allLSPs = await LSPModel.find(); // Fetch all LSPs from the database

      if (allLSPs.length === 0) {
          const error = new Error('No LSPs found');
          error.statusCode = 404;
          throw error;
      }

      res.status(200).json(allLSPs); // Send the retrieved LSPs as JSON response
  } catch (error) {
      // Handle errors
      console.error('Error fetching LSPs:', error);
      return next(error);
  }
});

  const getLSPByName = asyncHandler(async (req, res,next) => {
    const { names } = req.body;
  
    if (!names || !Array.isArray(names) || names.length === 0) {
      const error = new Error('Please provide an array of lsp names.')
      error.statusCode(400);
      throw(error);
    }
  
    try {
      const lsps = await LSPModel.find({ name: { $in: names } });
  
      if (lsps.length === 0) {
        const error = new Error('No lsp found with the provided names.')
        error.statusCode(404);
        throw(error);
      }
  
      res.status(200).json(lsps);
    } catch (error) {  
        return next(error);
    }
  });

  // const insertAllLSPs = asyncHandler( async(req,res,next)=>{
  //   try {
  //     const __dirname = path.dirname(fileURLToPath(import.meta.url));
  //     const filePath = path.join(__dirname, '../../lspData.json');
  //     const rawData = fs.readFileSync(filePath);
    
  //   // Parse the JSON data
  //   const lspsData = JSON.parse(rawData);
  //   const collection = LSPModel.collection;

  //   // Bypass Mongoose and use native MongoDB driver to insert data
  //   await collection.insertMany(lspsData);
  //     // await LSPModel.insertMany(lspsData, { validateBeforeSave: false });
  //     res.status(200).json('LSP data inserted successfully');
  // } catch (err) {
  //     return next(err);
  // } 
  // })

  const convertToTimeZone = (date, timeZone) => {
    return moment(date).tz(timeZone).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  };

  const getSlotsById = asyncHandler(async(req,res,next)=>{
    try {
      const lspId = req.params.id;
      const lsp = await LSPModel.findById(lspId);
      if (!lsp) {
        const error = new Error('LSP not found')
        error.statusCode(404);
        throw(error);
      }
  
      const timeZone = 'Asia/Kolkata'; // GMT+5:30
  
      const convertedSlots = [];
      for (const daySlots of lsp.slots) {
        const slots = daySlots.map(slot => ({
          _id: slot._id,
          startTime: convertToTimeZone(slot.startTime, timeZone),
          endTime: convertToTimeZone(slot.endTime, timeZone),
          isBooked: slot.isBooked
        }));
        convertedSlots.push(slots);
      }
  
      res.status(200).json(convertedSlots);
    } catch (error) {
      return next(error);
    }
  });

  const getBookedClients = asyncHandler(async(req,res,next)=>{
    try{
      const lspId = req.params.id;

      // Find the LSP by lspId
      const lsp = await LSPModel.findById(lspId);
  
      if (!lsp) {
        const error = new Error("LSP not found");
        error.statusCode = 404;
        throw(error);
      }
      const bookedClients = await UserModel.find({ 'bookedSlots.lspId': lspId }).lean(); // Use lean() for faster queries
      const result = bookedClients.map(client => {
        // Find the booked slot for this LSP in the client's bookedSlots
        const bookedSlot = client.bookedSlots.find(slot => slot.lspId.toString() === lspId.toString());
        
        // Find the slot details from the LSP's slot array
        let slotDetails;
        for (const slotArray of lsp.slots) {
            slotDetails = slotArray.find(slot => slot._id.toString() === bookedSlot.slot.toString());
            if (slotDetails) break;
        }

        // Return combined client and slot information
        return {
            client,
            slot: {
              _id: slotDetails._id,
              startTime: convertToTimeZone(slotDetails.startTime, timeZone),
              endTime: convertToTimeZone(slotDetails.endTime, timeZone),
              isBooked: slotDetails.isBooked
            }
        };
    });

    res.status(200).json(result); 
} catch (error) {
    return next(error);
}
});

  export {
       getAllDetails,
       getLSPByName,
       getSlotsById,
       getBookedClients
  }