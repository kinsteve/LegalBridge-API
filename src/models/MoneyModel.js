import mongoose from 'mongoose';
import slugify from 'slugify';
import 'uuid';

const walletSchema = new mongoose.Schema({
    name: 
    { type: String,
      maxlength: 100,
      unique: true,
      sparse: true 
    },
    slug: 
    { 
        type: String, 
        maxlength: 150, 
        unique: true, 
        sparse: true 
    },
    balance: { 
        type: Number, 
        default: 0 
    },
});

walletSchema.pre('save', function (next) {
  if (!this.name) {
    this.name = `Wallet ${uuid.v4()}`;
  }
  const slug = slugify(this.name, { lower: true });
  if (!this.slug || this.slug !== slug) {
    this.slug = slug;
  }
  next();
});

const WalletModel = mongoose.model('Wallet', walletSchema);

  const transactionSchema = new mongoose.Schema({
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletModel' },
    transaction_type: {
      type: String,
      enum: ['income', 'outcome'],
      default: 'income',
    },
    date: { type: Date, default: Date.now },
    amount: { type: Number, default: 0 },
    comment: { type: String, maxlength: 2500 },
  });


  transactionSchema.methods.isDeletionPossible = async function () {
    if (this.transaction_type === 'income') {
      return this.wallet.balance >= this.amount;
    }
    return true;
  };
  
  const TransactionModel = mongoose.model('Transaction', transactionSchema);

  export {
      WalletModel,
      TransactionModel
  };