import type { NextFunction, Request, Response } from 'express';

export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction) {
    if (error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'DatosInvalidos' });
        return;
    }
    next(error);
}
