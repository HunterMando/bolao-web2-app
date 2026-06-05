import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

// 🛡️ BLINDAGEM PARA WINDOWS: 
// Pega o caminho absoluto da pasta atual (src) e força o uso de barras normais (/)
const rotasPath = path.resolve(__dirname, './api/**/*.ts').replace(/\\/g, '/');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Bolão App',
      version: '1.0.0',
      description: 'Documentação oficial da API do sistema de Apostas e Bolões.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local (Desenvolvimento)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o seu token JWT aqui para testar rotas protegidas'
        }
      }
    }
  },
  // 👈 Agora o Swagger sabe exatamente onde procurar, não importa o Sistema Operacional!
  apis: [rotasPath], 
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};