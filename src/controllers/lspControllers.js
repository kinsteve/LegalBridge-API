import asyncHandler from "express-async-handler";
import LSPModel from "../models/LSP.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../../lspData.json'assert { type: 'json' };
// const lspsData = require('./lspsData.json');


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

  const getLSPByName = asyncHandler(async (req, res,next) => {
    const { names } = req.body;
  
    if (!names || !Array.isArray(names) || names.length === 0) {
      const error = new Error('Please provide an array of lawyer names.')
      error.statusCode(400);
      throw(error);
    }
  
    try {
      const lawyers = await LawyerModel.find({ name: { $in: names } });
  
      if (lawyers.length === 0) {
        const error = new Error('No lawyers found with the provided names.')
        error.statusCode(404);
        throw(error);
      }
  
      res.status(200).json(lawyers);
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

  export {
       getAllDetails,
       getLSPByName,
       insertAllLSPs
  }