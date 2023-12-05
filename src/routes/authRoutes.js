import { Router } from "express";
import {register,login, forgotPassword, resetPassword, emailCheck, sendOTP, verifyOTP} from '../controllers/authController.js'
const authRoutes = Router();

authRoutes
.post('/emailCheck', emailCheck)
.post('/register', register)
.post('/login' , login)
// .post('/logout , logout)
.post('/forgotPassword', forgotPassword)
.patch('/resetPassword/:token', resetPassword)
.get('/resetPassword/:token', (req, res) => {
    res.render('passwordReset'); 
  })
  .get('/message',(req,res)=>{
    res.render('message')
  })
.post('/sendOTP',sendOTP)
.post('/verifyOTP' , verifyOTP);
  
export default authRoutes;