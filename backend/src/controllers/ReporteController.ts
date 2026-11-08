import type { Request, Response } from 'express';
import type { ReporteService } from '../services/ReporteService';

export class ReporteController {
    constructor(private readonly servicio: ReporteService) {}

    facturacion = (_req: Request, res: Response): void => {
        res.json({ total: this.servicio.facturacionTotal() });
    };
    masVendido = (_req: Request, res: Response): void => {
        const resultado = this.servicio.tipoMasVendido();

        if (resultado === undefined) {
            res.status(404).json({ error: 'SinVentas' });
            return;
        }

        res.json(resultado);
    };
    cantidades = (_req: Request, res: Response): void => {
        res.json(this.servicio.cantidadVendidaPorTipo());
    };
}