import {Router} from 'express';
import {profile,updateUser} from '../controllers/userController.js';
import {protect, restrictTo} from '../middlewares/authMiddleware.js';
const userRoutes = Router();

userRoutes.get('/' ,protect,restrictTo('user','admin'),profile);
userRoutes.put('/',protect,restrictTo('user','admin'),updateUser);


export default userRoutes  ;