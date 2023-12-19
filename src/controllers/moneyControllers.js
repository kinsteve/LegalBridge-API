
import { WalletModel, TransactionModel } from "../models/MoneyModel.js";
import asyncHandler from "express-async-handler";

//---------------------Wallet Controllers------------------------------
const getAllWallets = asyncHandler( async(req,res)=>{
      const wallets = await WalletModel.find();
      if(!wallets){
        res.status(400)
        throw new Error("No wallet found");
      }
      else{
        res.status(200).json(wallets);
      }
})

const createWallet = asyncHandler(async (req, res) => {
  const { name } = req.body;

  try {
    // Checking if the name is already in use
    const existingWallet = await WalletModel.findOne({ name });

    if (existingWallet) {
      return res.status(400).json({ success: false, message: 'Wallet name already exists' });
    }

    // Create a new wallet
    const wallet = await WalletModel.create({ name });

    // Send success response upon successful creation
    res.status(201).json({ success: true, data: wallet });
  } catch (error) {
    // Handle other errors
    res.status(500)
    throw new Error("Internal Server Error", error.message);
  }
});

const updateWallet = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  try {
    const wallet = await WalletModel.findOne({ slug });

    if (!wallet) {
      res.status(404)
      throw new Error('Wallet not found');
    }

    wallet.name = req.body.name; 

    await wallet.save();

    return res.status(200).json({ success: true, message: 'Wallet updated successfully', data: wallet });
  } catch (error) {
    res.status(500);
    throw new Error('Internal server error',error.message);
  }
});

const deleteWallet = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  try {
    const wallet = await WalletModel.findOneAndDelete({ slug });

    if (!wallet) {
      res.status(404)
      throw new Error('Wallet not found');
    }

    return res.status(200).json({ success: true, message: 'Wallet deleted successfully' });
  } catch (error) {
      res.status(500)
      throw new Error('Internal server error',error);
  }
})














//-------------------------Transaction Controllers-----------------------------------
const createTrans = asyncHandler( async (req, res) => {
    const { walletId, transaction_type, amount } = req.body;
    
    try {
      const existingWallet = await WalletModel.findById(walletId);
      if (!existingWallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found' });
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
        return res.status(400).json({ success: false, message: 'Failed to provide transaction' });
      }
    } catch (error) {
      res.status(500)
      throw new Error('Internal server error',error.message);
    }
  });

  const getAllTrans = asyncHandler(async (req, res) => {
    try {
      const transactions = await TransactionModel.find(); 
  
      return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
       res.status(500)
       throw new Error('Internal server error',error.message);
    }
  });

  const getAllSlugTrans = asyncHandler(async (req, res) => {
    const walletSlug = req.params.slug;
  
    try {
      const wallet = await WalletModel.findOne({ slug: walletSlug });
  
      if (!wallet) {
        res.status(404)
        throw new Error('Wallet not found');
      }
  
      const transactions = await TransactionModel.find({ wallet: wallet._id });
  
      return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      res.status(500)
      throw new Error('Internal server error',error);
    }
  });
  

  const deleteTrans = asyncHandler(async (req, res) => {
    try {
      const { transactionId } = req.params;
      const transaction = await TransactionModel.findById(transactionId);
  
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
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
      if (error.message === 'Deletion is not possible') {
        res.status(400);
        throw new Error(error.message);
      }
      res.status(500);
       throw new Error('Internal server error' );
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