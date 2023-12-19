import {Router} from 'express';
import {profile, updateUserDetails,bookingSlot} from '../controllers/userController.js';
import {protect, restrictTo} from '../middlewares/authMiddleware.js';
const userRoutes = Router();

userRoutes.get('/' ,protect,restrictTo('user','admin'),profile);
userRoutes.patch('/:id',protect,restrictTo('user','admin'),updateUserDetails);
userRoutes.post('/booking',bookingSlot);

export default userRoutes  ;