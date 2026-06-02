// src/api/campanha_opcao/model.ts
export interface CreateCampanhaOpcaoDTO {
    descricao:   string;
    campanha_id: number; // A que campanha pertence esta opção?
    status?:     boolean;
}

// Nota: Não colocamos o 'eh_resultado_final' no DTO de criação de propósito! 
// O cliente (Front-end) não deve ter o poder de enviar isso ao criar a opção.