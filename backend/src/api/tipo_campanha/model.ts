// src/api/tipo_campanha/model.ts
export interface CreateTipoCampanhaDTO {
    descricao: string;
    status?: boolean; // Opcional no envio, pois definimos um valor default no Prisma
}

export interface UpdateTipoCampanhaDTO {
    descricao?: string;
    status?: boolean;
}