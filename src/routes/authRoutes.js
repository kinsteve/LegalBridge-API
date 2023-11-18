import { Router } from "express";
import {register,login} from '../controllers/authController.js'
const authRoutes = Router();

authRoutes
.post('/register',register)
.post('/login' , login);

export default authRoutes;