import express, { Request, Response } from 'express';

import cors from 'cors';

import usuarioRoutes from './api/usuario/routes';
import tipoCampanhaRoutes from './api/tipo_campanha/routes';
import campanhaRoutes from './api/campanha/routes';
import campanhaOpcaoRoutes from './api/campanha_opcao/routes';
import meioPagamentoRoutes from './api/meio_pagamento/routes';
import apostaRoutes from './api/aposta/routes';
import dashboardRoutes from './api/dashboard/routes';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());

// Teste inicial
app.get('/', (req: Request, res: Response) => {
    res.send('API do Sistema de Bolão e Apostas rodando com sucesso!');
});

// Registra as rotas de usuários
app.use('/usuarios', usuarioRoutes);
app.use('/tipos-campanha', tipoCampanhaRoutes);
app.use('/campanhas', campanhaRoutes);
app.use('/campanhas-opcoes', campanhaOpcaoRoutes);
app.use('/meios-pagamento', meioPagamentoRoutes);
app.use('/apostas', apostaRoutes);
app.use('/dashboard', dashboardRoutes);

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em: http://localhost:${port}`);
});