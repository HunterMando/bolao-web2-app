-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "tipo_usuario" TEXT NOT NULL DEFAULT 'COMUM',
    "senha" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_campanha" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipo_campanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanha" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dt_inicio" TIMESTAMP(3) NOT NULL,
    "dt_fim" TIMESTAMP(3) NOT NULL,
    "taxa_operacional" DOUBLE PRECISION NOT NULL,
    "valor_bolao" DOUBLE PRECISION NOT NULL,
    "codigo_campanha" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "tipo_campanha_id" INTEGER NOT NULL,

    CONSTRAINT "campanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanha_opcoes" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "eh_resultado_final" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "campanha_id" INTEGER NOT NULL,

    CONSTRAINT "campanha_opcoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meio_pagamento" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "meio_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aposta_bolao" (
    "id" SERIAL NOT NULL,
    "dt_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprovante" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "usuario_id" INTEGER NOT NULL,
    "meio_pagamento_id" INTEGER NOT NULL,
    "campanha_opcao_id" INTEGER NOT NULL,

    CONSTRAINT "aposta_bolao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_cpf_key" ON "usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "campanha_codigo_campanha_key" ON "campanha"("codigo_campanha");

-- CreateIndex
CREATE UNIQUE INDEX "campanha_opcoes_campanha_id_descricao_key" ON "campanha_opcoes"("campanha_id", "descricao");

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_tipo_campanha_id_fkey" FOREIGN KEY ("tipo_campanha_id") REFERENCES "tipo_campanha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanha_opcoes" ADD CONSTRAINT "campanha_opcoes_campanha_id_fkey" FOREIGN KEY ("campanha_id") REFERENCES "campanha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aposta_bolao" ADD CONSTRAINT "aposta_bolao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aposta_bolao" ADD CONSTRAINT "aposta_bolao_meio_pagamento_id_fkey" FOREIGN KEY ("meio_pagamento_id") REFERENCES "meio_pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aposta_bolao" ADD CONSTRAINT "aposta_bolao_campanha_opcao_id_fkey" FOREIGN KEY ("campanha_opcao_id") REFERENCES "campanha_opcoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
