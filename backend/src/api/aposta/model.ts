// src/api/aposta/model.ts
export interface CreateApostaDTO {
    usuario_id:        number;
    meio_pagamento_id: number;
    campanha_opcao_id: number;
    comprovante?:      string; // Opcional (URL ou base64 da imagem do recibo)
    // Nota: dt_criacao e status não vêm no DTO porque o banco gera ("now()" e "PENDENTE")
}