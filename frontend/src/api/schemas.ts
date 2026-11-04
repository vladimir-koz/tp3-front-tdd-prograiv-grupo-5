import { z } from 'zod';

export const ProductoSchema = z.object({});

export type Producto = z.infer<typeof ProductoSchema>;
