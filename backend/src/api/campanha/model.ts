// src/api/campanha/model.ts
export interface CreateCampanhaDTO {
    nome:             string;
    dt_inicio:        string; // Receberemos como string ISO (ex: "2023-12-01T10:00:00Z") e o controller converte
    dt_fim:           string;
    taxa_operacional: number;
    valor_bolao:      number;
    codigo_campanha:  string;
    tipo_campanha_id: number; // Chave estrangeira obrigatória
    status?:          boolean;
}

export interface UpdateCampanhaDTO {
    nome?:             string;
    dt_inicio?:        string;
    dt_fim?:           string;
    taxa_operacional?: number;
    valor_bolao?:      number;
    status?:           boolean;
}