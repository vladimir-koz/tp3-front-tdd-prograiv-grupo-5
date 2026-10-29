import type { Request, Response } from 'express';
import { PedidoService, ProductoInexistenteError } from '../services/PedidoService';
import { z } from 'zod';

const crearPedidoSchema = z.object({
    mesa: z.number().int().positive().nullable().optional(),
    items: z.array(z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().int().positive()
    })).min(1)
}).strict();

export class PedidoController {
    constructor(private readonly servicio: PedidoService) {}

    listar = (req: Request, res: Response): void => {
        const mesaTexto = req.query.mesa;

        if (mesaTexto === undefined) {
            res.json(this.servicio.listarPedidos());
            return;
        }

        if (typeof mesaTexto !== 'string') {
            res.status(400).json({ error: 'DatosInvalidos' });
            return;
        }

        const mesa = Number(mesaTexto);

        if (!Number.isSafeInteger(mesa) || mesa <= 0) {
            res.status(400).json({ error: 'DatosInvalidos' });
            return;
        }

        res.json(this.servicio.listarPedidos(mesa));
    };
    obtenerPorId = (req: Request, res: Response): void => {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({ error: 'DatosInvalidos' });
            return;
        }

        const pedido = this.servicio.obtenerPedido(id);

        if (pedido === undefined) {
            res.status(404).json({ error: 'NoEncontrado' });
            return;
        }

        res.json(pedido);
    };
    crear = (req: Request, res: Response) => {
        const validacion = crearPedidoSchema.safeParse(req.body);

        if (!validacion.success) {
            res.status(400).json({ error: 'DatosInvalidos' });
            return;
        }

        try {
            const pedido = this.servicio.crearPedido(validacion.data);
            res.status(201).json(pedido);
        } catch (e) {
            if (e instanceof ProductoInexistenteError) {
                return res.status(400).json({ error: 'ProductoInexistente', productoId: e.productoId });
            }
            throw e;
        }
    };
}