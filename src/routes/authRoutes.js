import { Router } from "express";
import {register,login, forgotPassword, resetPassword} from '../controllers/authController.js'
const authRoutes = Router();

authRoutes
.post('/register', register)
.post('/login' , login)
.post('/forgotPassword', forgotPassword)
.patch('/resetPassword/:token', resetPassword)
.get('/resetPassword/:token', (req, res) => {
    res.render('passwordReset'); 
  })
.get('/message',(req,res)=>{
  res.render('message')
});

export default authRoutes;