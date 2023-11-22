import { Router } from "express";
import {register,login, forgotPassword, resetPassword} from '../controllers/authController.js'
const authRoutes = Router();

authRoutes
.post('/register', register)
.post('/login' , login)
.post('/forgotPassword', forgotPassword)
.patch('/resetPassword/:token', resetPassword);

export default authRoutes;