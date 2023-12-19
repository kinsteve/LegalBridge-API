
import { WalletModel, TransactionModel } from "../models/MoneyModel.js";
import asyncHandler from "express-async-handler";

//---------------------Wallet Controllers------------------------------
const getAllWallets = asyncHandler( async(req,res,next)=>{
  try {
    const wallets = await WalletModel.find();
        if(!wallets){
          const error = new Error("No wallet found");
          error.statusCode = 400; 
          throw error;
        }
        else{
          res.status(200).json(wallets);
        }
  } catch (error) {
    return next(error);
  }   
})

const createWallet = asyncHandler(async (req, res,next) => {
  const { name } = req.body;
  
  try {
    // Checking if the name is already in use
    const existingWallet = await WalletModel.findOne({name});

    if (existingWallet) {
      const error = new Error('Wallet name already exists');
      error.statusCode = 400; 
      throw error;
    }

    // Create a new wallet
    const wallet = await WalletModel.create({ name , user: req.user });

    // Send success response upon successful creation
    res.status(201).json({ success: true, data: wallet });
  } catch (error) {
    // Handle other errors
    return next(error);
  }
});

const updateWallet = asyncHandler(async (req, res,next) => {
  const { slug } = req.params;

  try {
    const wallet = await WalletModel.findOne({ slug });

    if (!wallet) {
      const error = new Error('Wallet not found');
      error.statusCode = 404; 
      throw error;
    }

    wallet.name = req.body.name; 

    await wallet.save();

    return res.status(200).json({ success: true, message: 'Wallet updated successfully', data: wallet });
  } catch (error) {
    return next(error);
  }
});

const deleteWallet = asyncHandler(async (req, res,next) => {
  const { slug } = req.params;

  try {
    const wallet = await WalletModel.findOneAndDelete({ slug });

    if (!wallet) {
      const error = new Error('Wallet not found');
      error.statusCode = 404; 
      throw error;
    }

    return res.status(200).json({ success: true, message: 'Wallet deleted successfully' });
  } catch (error) {
      return next(error);
  }
})














//-------------------------Transaction Controllers-----------------------------------
const createTrans = asyncHandler( async (req, res,next) => {
    const { walletId, transaction_type, amount } = req.body;
    
    try {
      const existingWallet = await WalletModel.findById(walletId);
      if (!existingWallet) {
        const error = new Error('Wallet not found');
        error.statusCode = 404; 
        throw error;
      }
  
      let success = false;
      if (transaction_type === 'income') {
        existingWallet.balance += amount;
        await existingWallet.save();
        success = true;
      } else if (transaction_type === 'outcome' && existingWallet.balance >= amount) {
        existingWallet.balance -= amount;
        await existingWallet.save();
        success = true;
      }
      
      if (success) {
        return res.status(200).json({ success: true, message: 'Transaction provided successfully' });
      } else {
        const error = new Error('Failed to provide transaction');
        error.statusCode = 404; 
        throw error;
      }
    } catch (error) {
      return next(error);
    }
  });

  const getAllTrans = asyncHandler(async (req, res,next) => {
    try {
      const transactions = await TransactionModel.find(); 
  
      return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      return next(error);
    }
  });

  const getAllSlugTrans = asyncHandler(async (req, res,next) => {
    const walletSlug = req.params.slug;
  
    try {
      const wallet = await WalletModel.findOne({ slug: walletSlug });
  
      if (!wallet) {
        const error = new Error('Wallet Not Found');
        error.statusCode = 404; 
        throw error;
      }
  
      const transactions = await TransactionModel.find({ wallet: wallet._id });
  
      return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      return next(error);
    }
  });
  

  const deleteTrans = asyncHandler(async (req, res,next) => {
    try {
      const { transactionId } = req.params;
      const transaction = await TransactionModel.findById(transactionId);
  
      if (!transaction) {
        const error = new Error('Transaction not Found');
        error.statusCode = 404; 
        throw error;
      }
  
      const isPossible = await transaction.isDeletionPossible(); // Using instance method
  
      if (!isPossible) {
        throw new Error('Deletion is not possible');
      }
  
      const existingWallet = await Wallet.findById(transaction.wallet);
  
      if (transaction.transaction_type === 'income') {
        existingWallet.balance -= transaction.amount;
        await existingWallet.save();
      }
  
      await transaction.remove(); // Delete the transaction
  
      return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
       return next(error);
    }
  });

  export{
    createTrans,
    deleteTrans,
    getAllWallets,
    createWallet,
    updateWallet,
    deleteWallet,
    getAllTrans,
    getAllSlugTrans
  }