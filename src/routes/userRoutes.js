import {Router} from 'express';
import {profile, updateUserDetails,bookingSlot, findNearestLSPsToUser, findBookedSlots} from '../controllers/userController.js';
import {protect, restrictTo} from '../middlewares/authMiddleware.js';
const userRoutes = Router();

userRoutes.get('/' ,protect,restrictTo('user','admin'),profile)
.patch('/:id',protect,restrictTo('user','admin'),updateUserDetails)
.post('/:lspId/slots/:slotId/book',protect,restrictTo('user'),bookingSlot)
.post('/nearLSP',protect,findNearestLSPsToUser)
.get('/:userId/booked-slots',protect,findBookedSlots)


export default userRoutes  ;