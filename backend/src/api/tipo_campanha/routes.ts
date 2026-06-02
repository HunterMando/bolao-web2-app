// src/api/tipo_campanha/routes.ts
import { Router } from 'express';
import * as tipoCampanhaController from './controller';

const router = Router();

router.post('/', tipoCampanhaController.create);
router.get('/', tipoCampanhaController.getAll);
router.put('/:id', tipoCampanhaController.update);

export default router;