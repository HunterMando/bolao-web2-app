import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';

const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123';

// Vamos estender a tipagem do Request do Express para poder guardar os dados do utilizador
export interface AuthRequest extends Request {
    usuario?: any; // Guardará o ID e o tipo_usuario
}

export const autenticar = (req: AuthRequest, res: Response, next: NextFunction): any => {
    // 1. Procurar o crachá (Token) no cabeçalho do pedido
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    // O padrão de mercado é enviar o token assim: "Bearer <token_gigante>"
    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Formato do token inválido.' });
    }

    const token = partes[1];

    // 2. Verificar se o crachá é verdadeiro ou se já expirou
    jwt.verify(token, JWT_SECRET, (erro, decodificado) => {
        if (erro) {
            return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Token inválido ou expirado.' });
        }

        // 3. Crachá validado! Guardamos os dados no 'req' e abrimos a porta (next)
        req.usuario = decodificado;
        return next();
    });
};

// Novo middleware para verificar se é Administrador
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): any => {
    // Verificamos se a requisição já passou pelo middleware "autenticar"
    if (!req.usuario) {
        return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Utilizador não autenticado.' });
    }

    // REGRA DE NEGÓCIO: Só passa se o tipo for ADMIN
    if (req.usuario.tipo_usuario !== 'ADMIN') {
        return res.status(httpStatus.FORBIDDEN).json({ 
            erro: 'Acesso negado. Apenas administradores podem realizar esta ação.' 
        });
    }

    // É administrador? Pode seguir em frente!
    return next();
};