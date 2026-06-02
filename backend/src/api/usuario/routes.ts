// src/api/usuario/routes.ts
import { Router } from 'express';
import * as usuarioController from './controller';

const router = Router();

router.post('/login', usuarioController.login);
router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.remove);

export default router;