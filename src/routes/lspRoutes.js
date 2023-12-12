import {Router} from 'express';
import {protect,restrictTo} from '../middlewares/authMiddleware.js';
import { getAllDetails } from '../controllers/lspControllers.js';
const lspRoutes = Router();

lspRoutes.get('/',protect,getAllDetails);

export default lspRoutes;