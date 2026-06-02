import { Router } from 'express';
import * as campanhaController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

// 2. Colocamos os dois middlewares em fila: 
// Primeiro valida o token (autenticar), depois valida o cargo (isAdmin)
router.post('/', autenticar, isAdmin, campanhaController.create);

router.get('/', campanhaController.getAll);

router.patch('/:id/encerrar', autenticar, isAdmin, campanhaController.encerrar);

router.post('/:id/resultado', autenticar, isAdmin, campanhaController.definirResultado);

export default router;