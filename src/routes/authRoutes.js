import { Router } from "express";
import {forgotPassword, resetPassword, emailCheck, sendOTP, verifyOTP, registerUser, registerLSP, loginUser, loginLSP} from '../controllers/authController.js'
import UserModel from "../models/User.js";
import LSPModel from "../models/LSP.js";
const authRoutes = Router();

authRoutes
.post('/emailCheckUser', emailCheck(UserModel))
.post('/emailCheckLSP', emailCheck(LSPModel))
.post('/registerUser', registerUser)
.post('/registerLSP', registerLSP)
.post('/loginUser' , loginUser)
.post('/loginLSP' , loginLSP)
// .post('/logout , logout)
.post('/forgotPassword/user', forgotPassword(UserModel))
.post('/forgotPassword/lsp', forgotPassword(LSPModel))
.patch('/resetPassword/user/:token', resetPassword(UserModel))
.patch('/resetPassword/lsp/:token', resetPassword(LSPModel))
.get('/resetPassword/user/:token', (req, res) => {
    res.render('passwordReset'); 
  })
  .get('/message',(req,res)=>{
    res.render('message')
  })
.post('/sendOTP',sendOTP)
.post('/verifyOTP' , verifyOTP);
  
export default authRoutes;