import type { NextFunction, Request, Response } from 'express';

export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'DatosInvalidos' });
        return;
    }

    if (typeof error === 'object' && error !== null) {
        const status = [
            'status' in error ? error.status : undefined,
            'statusCode' in error ? error.statusCode : undefined
        ].find(value => typeof value === 'number' && value >= 400 && value < 600);

        if (status !== undefined && status !== 500) {
            next(error);
            return;
        }
    }

    res.status(500).json({ error: 'ErrorInterno' });
}
