# Cafetería Origen — API (Parcial 1, TUPProIV)

API REST para la cafetería de especialidad *Origen*: catálogo de productos
(café expreso, café filtrado y pastelería), pedidos y reportes de ventas.
TypeScript + Express + SQLite, con Vitest, Supertest y Playwright.
Este repositorio es una **guía funcional**: no acredita por sí mismo un historial
de TDD. En el repositorio grupal, cada comportamiento se implementará con
prueba roja, código verde y refactor cuando corresponda.

## Stack

- Node 20+ / npm
- TypeScript + Express
- **SQLite** (`better-sqlite3`)
- Zod (validación en los bordes)
- **Vitest** + Supertest (unitarios e integración)
- **Playwright Test** (E2E)

## Instalación

```bash
npm ci
npm run dev          # levanta el server en http://localhost:3000
```

En desarrollo los datos se guardan en `data/cafeteria.sqlite`. La primera vez
que se crea la base se cargan las 3 variedades y los 20 productos del
catálogo. El archivo se genera al ejecutar la app y no se versiona. Si
existe una base anterior sin columna `mesa`, `createDb()` la agrega sin borrar
pedidos. Para empezar de cero durante el desarrollo, se puede borrar el archivo.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (con recarga automática) |
| `npm test` | Corre los tests unitarios y de integración (Vitest) |
| `npm run test:watch` | Vitest en modo watch |
| `npm run coverage` | Reporte de cobertura (`coverage/index.html`) |
| `npm run test:e2e` | Corre los tests E2E (levanta el server solo para eso) |
| `npm run report:e2e` | Abre el reporte HTML de Playwright |

## Estructura

```
src/
  models/
    Variedad.ts             # Variedad de café (precio por gramo, acidez, cuerpo, notas)
    Producto.ts             # Producto (abstracta) → Cafe → Expreso / Filtrado, y Pasteleria
    Pedido.ts               # Pedido, ItemPedido, mesa opcional y estados
  db/connection.ts          # Esquema SQLite + carga inicial del catálogo
  repositories/
    ProductoRepository.ts   # Catálogo (solo lectura) → instancia la subclase correcta
    PedidoRepository.ts     # Pedidos + items (alta en transacción)
  services/
    ProductoService.ts      # Listar / obtener productos
    PedidoService.ts        # Crear / listar / obtener pedidos, cálculo del total
    ReporteService.ts       # Facturación, cantidad vendida, más vendido
  controllers/              # Validación con Zod (safeParse) + códigos HTTP
  routes/                   # Solo ruteo: endpoint → método del controller
  app.ts / server.ts        # makeApp(dbPath) arma todo; server.ts lo levanta
tests/unit/                 # Reglas aisladas: precios y reportes con dobles
tests/integration/          # SQLite, servicios con repositorios y rutas HTTP con Supertest
e2e/                        # Flujo completo con Playwright
```

## Decisiones de diseño

- **`calcularPrecio()` polimórfico.** `Producto` es una clase abstracta con
  `id`, `nombre` y `precioBase`. Cada subclase sabe calcular su precio:
  - `Cafe` (abstracta): `precioBase + gramos × variedad.precioPorGramo`.
    `Expreso` (18 / 27 / 36 g) y `Filtrado` (6 / 15 / 25 g) solo definen
    cuántos gramos usa cada tamaño (*Pocillo*, *Mediano*, *Taza grande*).
  - `Pasteleria`: el precio es el `precioBase`.

  Pedidos y reportes llaman a `calcularPrecio()` sin preguntar qué tipo de
  producto es. Agregar un producto nuevo (por ejemplo, un cold brew) es
  agregar una subclase y actualizar el catálogo y el esquema SQLite.
- **Un producto por cada combinación de la tabla.** El catálogo tiene 20
  productos: 9 expresos y 9 filtrados (tamaño × variedad), más 2 de
  pastelería. Un ítem del pedido referencia un único `productoId` y el precio
  queda definido sin parámetros extra.
- **El total no se guarda, se calcula.** Cada vez que se lee un pedido se
  calcula con `calcularPrecio() × cantidad`. Si cambia el precio del catálogo,
  cambiaría también el total de pedidos anteriores; el catálogo es fijo en
  esta versión. La facturación suma todos los pedidos, incluso los pendientes.
- **Los reportes se construyen sobre los servicios.** `ReporteService`
  depende de `PedidoService` y `ProductoService` (no de los repositorios).
  Suma cantidades por tipo: Expreso, Filtrado y Pastelería. Muffin y torta
  se cuentan juntos. Los tests unitarios usan dobles con `vi.fn()`.
- **Validación en el borde.** Los controllers validan con Zod usando
  `safeParse`. Los servicios asumen que reciben datos con la forma correcta
  y solo validan reglas de negocio, por ejemplo que el producto exista.

## Endpoints

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/productos` | 200 — lista de productos, cada uno con su `precio` calculado |
| GET | `/productos/:id` | 200 — producto · 404 `{ error: "NoEncontrado" }` |
| POST | `/pedidos` | 201 — pedido con su `total` · 400 `DatosInvalidos` / `ProductoInexistente` |
| GET | `/pedidos` | 200 — lista de pedidos con su `total` |
| GET | `/pedidos/:id` | 200 — pedido · 404 `{ error: "NoEncontrado" }` |
| GET | `/reportes/facturacion` | 200 — `{ total }` |
| GET | `/reportes/cantidades` | 200 — `{ "Expreso": 10, "Pastelería": 3 }` |
| GET | `/reportes/mas-vendido` | 200 — `{ tipo, cantidad }` · 404 `{ error: "SinVentas" }` |

`/reportes/cantidades` no figura en la consigna. Se agregó para poder
ver el resultado del punto 3, del que sale el tipo más vendido.

**Nuevo pedido:** `{ mesa?, items: [{ productoId, cantidad }] }`
- `mesa`: se puede omitir o enviar `null` para barra o para llevar. Si se
  indica, debe ser un entero mayor a 0. La respuesta siempre incluye
  `mesa: number | null`.
- `items`: al menos un ítem; `cantidad` debe ser un entero mayor a 0 y el
  producto debe existir.
- El servidor asigna el ID y el estado inicial `pendiente`. El cliente no
  puede elegir el estado al crear el pedido.
- `GET /pedidos/:id` busca por **ID de pedido**. Una mesa puede tener varios
  pedidos con distintos IDs.

La consigna no especifica cómo cambiar el estado; esta versión no expone una
ruta para hacerlo. El reporte por tipo es una decisión del grupo basada en el
ejemplo de la consigna. En un empate gana el primer tipo de este orden:
Expreso, Filtrado, Pastelería.

### Ids del catálogo

| Ids | Productos |
|---|---|
| 1–3 | Expreso Pocillo — Brasil, Colombia, Etiopía |
| 4–6 | Expreso Mediano — Brasil, Colombia, Etiopía |
| 7–9 | Expreso Taza grande — Brasil, Colombia, Etiopía |
| 10–12 | Filtrado Pocillo — Brasil, Colombia, Etiopía |
| 13–15 | Filtrado Mediano — Brasil, Colombia, Etiopía |
| 16–18 | Filtrado Taza grande — Brasil, Colombia, Etiopía |
| 19 | Muffin de chocolate |
| 20 | Porción de torta selva negra |

## Ejemplos curl

```bash
curl http://localhost:3000/productos
curl http://localhost:3000/productos/9

curl -X POST http://localhost:3000/pedidos -H "Content-Type: application/json" \
  -d '{"mesa":7,"items":[{"productoId":1,"cantidad":2},{"productoId":20,"cantidad":1}]}'

curl http://localhost:3000/pedidos
curl http://localhost:3000/pedidos/1

curl http://localhost:3000/reportes/facturacion
curl http://localhost:3000/reportes/mas-vendido
```

## Tests

- **Unitarios** (`tests/unit/`): `calcularPrecio()` para las 20 filas de
  la tabla y `ReporteService` aislado con dobles (`vi.fn`).
- **Integración** (`tests/integration/`): servicios con repositorios SQLite,
  persistencia en archivo y rutas con Supertest sobre `makeApp(':memory:')`.
  Se incluyen casos de error (400 y 404).
- **E2E** (`e2e/`): un flujo completo (consultar catálogo, crear un pedido y
  ver los reportes) y un caso de error.
