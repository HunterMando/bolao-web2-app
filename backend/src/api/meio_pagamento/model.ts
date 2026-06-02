// src/api/meio_pagamento/model.ts
export interface CreateMeioPagamentoDTO {
    descricao: string;
    status?:   boolean; // Opcional, pois o Prisma define como 'true' por defeito
}

export interface UpdateMeioPagamentoDTO {
    descricao?: string;
    status?:    boolean;
}