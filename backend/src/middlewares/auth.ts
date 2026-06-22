import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123';

export interface AuthRequest extends Request {
    usuario?: any;
}

// Transformamos o middleware numa função assíncrona raiz (async)
export const autenticar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Formato do token inválido.' });
    }

    const token = partes[1];

    try {
        // 1. Decodifica o token de forma imediata e síncrona
        const decodificado = jwt.verify(token, JWT_SECRET) as any;

        // 2. Obriga o Express a esperar pela resposta da base de dados
        const usuarioAoVivo = await prisma.usuario.findUnique({
            where: { id: decodificado.id },
            select: { status: true }
        });

        // 3. A Guilhotina: Se não existir ou se estiver inativo, corta o acesso na hora
        if (!usuarioAoVivo || usuarioAoVivo.status === false) {
            return res.status(httpStatus.FORBIDDEN).json({ erro: 'Sessão encerrada: Conta de utilizador inativa.' });
        }

        // 4. Utilizador está ativo! Pode seguir.
        req.usuario = decodificado;
        return next();
    } catch (error) {
        // Se o token foi adulterado ou expirou, cai direto aqui
        return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Token inválido ou expirado.' });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.usuario) {
        return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Utilizador não autenticado.' });
    }

    if (req.usuario.tipo_usuario !== 'ADMIN') {
        return res.status(httpStatus.FORBIDDEN).json({ 
            erro: 'Acesso negado. Apenas administradores podem realizar esta ação.' 
        });
    }

    return next();
};