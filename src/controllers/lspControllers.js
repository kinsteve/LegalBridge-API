import asyncHandler from "express-async-handler";
import LSPModel from "../models/LSP.js";

const getAllDetails = asyncHandler( async (req, res) => {
    try {
      const allLSPs = await LSPModel.find(); // Fetch all LSPs from the database
  
      if (allLSPs.length === 0) {
        return res.status(404).json({ message: 'No LSPs found' });
      }
  
      res.status(200).json(allLSPs); // Send the retrieved LSPs as JSON response
    } catch (error) {
      // Handle errors
      console.error('Error fetching LSPs:', error);
      res.status(500).json({ message: 'Error Fetching LSPs Details' });
    }
  });

  export {
       getAllDetails,
  }