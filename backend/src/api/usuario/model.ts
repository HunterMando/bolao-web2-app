// src/api/usuario/model.ts
export interface CreateUsuarioDTO {
    nome:         string;
    cpf:          string;
    email:        string;
    telefone?:    string; // Opcional
    tipo_usuario: string;
    senha:        string;
}

export interface UpdateUsuarioDTO {
    nome?:     string;
    telefone?: string;
    status?:   boolean;
}