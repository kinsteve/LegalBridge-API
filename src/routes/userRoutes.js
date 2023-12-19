import {Router} from 'express';
import {profile, updateUserDetails,bookingSlot, findNearestLSPsToUser} from '../controllers/userController.js';
import {protect, restrictTo} from '../middlewares/authMiddleware.js';
const userRoutes = Router();

userRoutes.get('/' ,protect,restrictTo('user','admin'),profile)
.patch('/:id',protect,restrictTo('user','admin'),updateUserDetails)
.post('/booking',bookingSlot)
.post('/nearLSP',protect,findNearestLSPsToUser)

export default userRoutes  ;