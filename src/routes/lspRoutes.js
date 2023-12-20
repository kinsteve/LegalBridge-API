import {Router} from 'express';
import {protect,restrictTo} from '../middlewares/authMiddleware.js';
import { getAllDetails, getLSPByName } from '../controllers/lspControllers.js';
const lspRoutes = Router();



lspRoutes
.get('/',protect,getAllDetails)
.post('/getLSPByName' ,protect, getLSPByName)
// .get('/insertAllLSPs', protect, insertAllLSPs)

export default lspRoutes;