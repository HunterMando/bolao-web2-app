// src/api/campanha_opcao/routes.ts
import { Router } from 'express';
import * as campanhaOpcaoController from './controller';

const router = Router();

router.post('/', campanhaOpcaoController.create);
router.get('/campanha/:campanhaId', campanhaOpcaoController.getByCampanha);
router.put('/:id/resultado-final', campanhaOpcaoController.definirResultadoFinal);

export default router;