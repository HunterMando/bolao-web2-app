# 🏆 Bolão App - Sistema de Apostas e Bolões (DAW 2)

Projeto Full-Stack desenvolvido para a disciplina de **Desenvolvimento de Aplicações Web 2**. Trata-se de uma plataforma completa e segura para gestão de campanhas de apostas desportivas (bolões), apuração de resultados e distribuição de prémios.

---

## ✨ Principais Funcionalidades

O sistema foi arquitetado com foco em segurança, resiliência e Experiência do Utilizador (UX), dividindo-se em dois fluxos principais através de **RBAC (Role-Based Access Control)**:

### 🛡️ Módulo do Administrador (Admin)
* **Gestão de Campanhas:** Criação de eventos com datas de bloqueio automático, taxa operacional da banca e definição de opções de palpites (dinâmicas).
* **Painel Financeiro (Dashboard):** Visão geral de métricas, total de apostas e dinheiro arrecadado isolado por inquilino (Multi-tenant).
* **Fila de Aprovações:** Validação manual de pagamentos (comprovantes PIX/Transferência) antes de aceitar a aposta no sistema.
* **Apuração Segura:** Definição do resultado final com transações no banco de dados para garantir que apostadores sejam marcados como `VENCEDOR` ou `PERDEDOR` simultaneamente.

### 👤 Módulo do Apostador (Comum)
* **Montra de Campanhas:** Visualização de campanhas ativas disponíveis para aposta.
* **Sistema de Apostas:** Realização de palpites com envio de comprovantes de pagamento de forma fluída.
* **Carteira (Meus Bolões):** Acompanhamento em tempo real do estado do bilhete (`PENDENTE`, `APROVADO`, `VENCEDOR`, `PERDEDOR`) e valor do prémio ganho no rateio.

### 🔒 Segurança & Validação (Double-Layer)
Implementamos uma validação de "Dupla Camada" utilizando o **Zod**:
1. **No Front-end (UX):** Bloqueia submissões inválidas instantaneamente com feedbacks visuais (bordas vermelhas dinâmicas e mensagens inline), poupando o servidor.
2. **No Back-end (Security):** Intercepta e barra requisições maliciosas (via Postman/Insomnia) antes de tocarem na base de dados Prisma.

---

## 🛠️ Tecnologias Utilizadas

### Back-end
* **Node.js** com **Express** (API RESTful)
* **TypeScript** (Tipagem estática e segurança)
* **Prisma ORM** (Gestão da base de dados)
* **PostgreSQL** (Base de dados relacional)
* **Zod** (Validação de schemas e segurança de payloads)
* **JWT (JSON Web Tokens)** & **Bcrypt** (Autenticação e criptografia)
* **Swagger** (Documentação interativa da API)

### Front-end
* **React** com **Vite** (Performance e build rápido)
* **TypeScript**
* **React Router DOM** (Navegação SPA e Rotas Protegidas)
* **Zod** (Validação visual de formulários)
* **React Hot Toast** (Notificações elegantes)
* **React Select** (Combobox modernos e estilizados)

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado (v18+ recomendado)
* Base de dados [PostgreSQL](https://www.postgresql.org/) a rodar localmente ou em nuvem.

### 1. Configurar o Back-end
Navegue até à pasta do backend e instale as dependências:
```bash
cd backend
npm install