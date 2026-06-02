// src/api/aposta/routes.ts
import { Router } from 'express';
import * as apostaController from './controller';
import { autenticar } from '../../middlewares/auth';

const router = Router();

router.post('/', apostaController.create);
router.get('/', apostaController.getAll);
router.get('/minhas', autenticar, apostaController.listarMinhas);

export default router;