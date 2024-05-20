import {Router} from 'express';
import {protect,restrictTo} from '../middlewares/authMiddleware.js';
import { getAllDetails, getBookedClients, getLSPByName, getSlotsById } from '../controllers/lspControllers.js';
const lspRoutes = Router();



lspRoutes
.get('/',protect,getAllDetails)
.post('/getLSPByName' ,protect, getLSPByName)
.get('/:id/slots',protect, getSlotsById)
.get('/:id/getBookedClients',protect,restrictTo("lsp","admin"),getBookedClients)
// .get('/insertAllLSPs', protect, insertAllLSPs)

export default lspRoutes;