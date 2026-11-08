import { ProductosSchema } from '../api/schemas';

// Catálogo tal como lo devuelve GET /productos (mismo orden e ids que el seed del backend).
// Incluye campos que el front no usa, como precioBase y precioPorGramo.

const variedades = [
  { id: 1, nombre: 'Brasil', precioPorGramo: 140, acidez: 'baja', cuerpo: 'denso', notas: 'avellana' },
  { id: 2, nombre: 'Colombia', precioPorGramo: 180, acidez: 'media', cuerpo: 'equilibrado', notas: 'cítricas y florales' },
  { id: 3, nombre: 'Etiopía', precioPorGramo: 240, acidez: 'muy viva', cuerpo: 'ligero', notas: 'frutales' }
];

// precio = precioBase + gramos * precioPorGramo (un precio por variedad, en el orden de arriba)
const cafes = [
  {
    tipo: 'expreso',
    etiqueta: 'Expreso',
    precioBase: 2500,
    tamanos: [
      { tamano: 'Pocillo', gramos: 18, precios: [5020, 5740, 6820] },
      { tamano: 'Mediano', gramos: 27, precios: [6280, 7360, 8980] },
      { tamano: 'Taza grande', gramos: 36, precios: [7540, 8980, 11140] }
    ]
  },
  {
    tipo: 'filtrado',
    etiqueta: 'Filtrado',
    precioBase: 3200,
    tamanos: [
      { tamano: 'Pocillo', gramos: 6, precios: [4040, 4280, 4640] },
      { tamano: 'Mediano', gramos: 15, precios: [5300, 5900, 6800] },
      { tamano: 'Taza grande', gramos: 25, precios: [6700, 7700, 9200] }
    ]
  }
];

const cafesApi = cafes.flatMap(cafe =>
  cafe.tamanos.flatMap(({ tamano, gramos, precios }) =>
    variedades.map((variedad, i) => ({
      tipo: cafe.tipo,
      nombre: `${cafe.etiqueta} ${tamano} ${variedad.nombre}`,
      precioBase: cafe.precioBase,
      tamano,
      gramos,
      variedad,
      precio: precios[i]
    }))
  )
);

export const catalogoApi = [
  ...cafesApi,
  { tipo: 'pasteleria', nombre: 'Muffin de chocolate', precioBase: 2500, precio: 2500 },
  { tipo: 'pasteleria', nombre: 'Porción de torta selva negra', precioBase: 4200, precio: 4200 }
].map((producto, i) => ({ id: i + 1, ...producto }));

export const productos = ProductosSchema.parse(catalogoApi);
