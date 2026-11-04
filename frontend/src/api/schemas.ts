import { z } from 'zod';

export const ProductoSchema = z.object({
  id: z.number().int(),
  tipo: z.literal('expreso'),
  nombre: z.string(),
  precio: z.number(),
  tamano: z.enum(['Pocillo', 'Mediano', 'Taza grande']),
  gramos: z.number(),
  variedad: z.object({
    id: z.number().int(),
    nombre: z.string(),
    acidez: z.string(),
    cuerpo: z.string(),
    notas: z.string()
  })
});

export type Producto = z.infer<typeof ProductoSchema>;
