// src/api/meio_pagamento/routes.ts
import { Router } from 'express';
import * as meioPagamentoController from './controller';

const router = Router();

router.post('/', meioPagamentoController.create);
router.get('/', meioPagamentoController.getAll);

export default router;