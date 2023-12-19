import {Router} from 'express';
import {protect,restrictTo} from '../middlewares/authMiddleware.js';

const moneyRouter = Router();

moneyRouter
.get('/wallets' , protect , restrictTo("admin") , getAllWallets)
.post('/wallets' , protect , createWallet)
.put('/wallets/:slug', protect , updateWallet)
.delete('/wallets/:slug', protect , deleteWallet)
//transactions
.get('/transactions',protect,restrictTo("admin") , getAllTrans)
.get('/transactions/:slug' , protect, getAllSlugTrans)
.delete('/transaction/:id', protect , deleteTrans)
.post('/transactions',protect,createTrans);