import {Router} from 'express';
import {profile, updateUserDetails} from '../controllers/userController.js';
import {protect, restrictTo} from '../middlewares/authMiddleware.js';
const userRoutes = Router();

userRoutes.get('/' ,protect,restrictTo('user','admin'),profile);
userRoutes.patch('/:id',protect,restrictTo('user','admin'),updateUserDetails);


export default userRoutes  ;