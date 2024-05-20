import {Router} from 'express';
import {protect,restrictTo} from '../middlewares/authMiddleware.js';
import { getAllDetails, getLSPByName, getSlotsById } from '../controllers/lspControllers.js';
const lspRoutes = Router();



lspRoutes
.get('/',protect,getAllDetails)
.post('/getLSPByName' ,protect, getLSPByName)
.get('/:id/slots',protect, getSlotsById)
// .get('/insertAllLSPs', protect, insertAllLSPs)

export default lspRoutes;