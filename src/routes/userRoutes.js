import {Router} from 'express';
import {profile} from '../controllers/userController.js';
import {protect, restrictTo} from '../middlewares/authMiddleware.js';
const userRoutes = Router();

userRoutes.get('/' ,protect,restrictTo('user','admin'),profile);


export default userRoutes  ;