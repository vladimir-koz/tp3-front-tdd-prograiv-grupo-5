import { z } from 'zod';

const ProductoBaseSchema = z.object({
  id: z.number().int(),
  nombre: z.string(),
  precio: z.number()
});

const CafeBaseSchema = ProductoBaseSchema.extend({
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

export const ProductoSchema = z.discriminatedUnion('tipo', [
  CafeBaseSchema.extend({ tipo: z.literal('expreso') }),
  CafeBaseSchema.extend({ tipo: z.literal('filtrado') }),
  ProductoBaseSchema.extend({ tipo: z.literal('pasteleria') })
]);

export type Producto = z.infer<typeof ProductoSchema>;
