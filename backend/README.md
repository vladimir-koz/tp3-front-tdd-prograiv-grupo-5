# Cafetería Origen — Backend del TP3 (Programación IV)

API REST para la cafetería de especialidad *Origen*: catálogo de productos
(café expreso, café filtrado y pastelería), pedidos y reportes de ventas.
Reutiliza la API del Parcial I y la adapta al menú web del TP3: devuelve precios
calculados y tipos de producto, registra pedidos con mesa opcional, permite
consultarlos y actualizar su estado. Los reportes se conservan del Parcial I.

## Stack

- Node.js 22 y npm 10
- TypeScript estricto + Express 4
- **SQLite** (`better-sqlite3`)
- Zod 3 (validación en los bordes)
- **Vitest 2** + Supertest (unitarios e integración)
- **Playwright Test** (E2E)

## Instalación

Desde la raíz del repositorio:

```sh
cd backend
npm ci
npm run dev          # levanta el server en http://localhost:3000
```

Todos los comandos siguientes se ejecutan desde `backend/`. `npm ci` instala
las versiones del `package-lock.json`. No se necesita un servidor SQLite externo.

Para compilar y ejecutar el resultado:

```sh
npm run build
npm start            # ejecuta dist/src/server.js
```

El puerto predeterminado es 3000; se puede cambiar mediante `PORT`.

El frontend se comunica con la API mediante el proxy de
`frontend/vite.config.ts`, configurado hacia `http://localhost:3000`.

## Persistencia y mesas

En desarrollo y en la ejecución compilada se utiliza
`backend/data/cafeteria.sqlite`, siempre que se arranque desde `backend/`.
El directorio y el archivo se crean automáticamente y la base no se versiona.
Con `NODE_ENV=test`, el servidor utiliza SQLite en memoria.

`createDb()` crea las tablas faltantes y, si el catálogo está vacío, carga
3 variedades y 20 productos: 18 cafés y 2 productos de pastelería.
La migración de mesas crea la tabla `mesas` y registra los números 1 al 25.
La inicialización es idempotente: no duplica registros ni elimina mesas
adicionales, pedidos o ítems existentes.

Para crear un pedido, la mesa indicada debe estar registrada. Si no existe,
la API rechaza el pedido sin guardar datos. Omitir `mesa` o enviar `null`
indica retiro en barra.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (con recarga automática) |
| `npm run build` | Compila TypeScript en `dist/` |
| `npm start` | Ejecuta el servidor compilado |
| `npm test` | Corre los tests unitarios y de integración (Vitest) |
| `npm run test:watch` | Vitest en modo watch |
| `npm run coverage` | Reporte de cobertura (`coverage/index.html`) |
| `npm run test:e2e` | Corre los tests E2E (levanta el server solo para eso) |
| `npm run report:e2e` | Abre el reporte HTML de Playwright |

## Organización y precios

`src/` separa modelos, repositorios SQLite, servicios, controladores y rutas.
Los controladores validan los datos con Zod y los servicios comprueban la
existencia de mesas y productos antes de guardar el pedido.

Cada combinación de bebida, tamaño y origen tiene su propio `productoId`.
El precio del café se calcula como `precioBase + gramos × precioPorGramo`;
en pastelería es el `precioBase`. El total del pedido es la suma de precios
por cantidades. No se almacena: se recalcula con los precios actuales al
consultar el pedido.

## Endpoints

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/health` | 200 — `{ "status": "ok" }` |
| GET | `/productos` | 200 — lista de productos, cada uno con su `precio` calculado |
| GET | `/productos/:id` | 200 — producto · 404 `{ error: "NoEncontrado" }` |
| POST | `/pedidos` | 201 — pedido completo · 400 `DatosInvalidos` / `MesaInexistente` / `ProductoInexistente` |
| GET | `/pedidos` | 200 — lista de pedidos; admite filtro `?mesa=4` |
| GET | `/pedidos/:id` | 200 — pedido · 404 `{ error: "NoEncontrado" }` |
| PATCH | `/pedidos/:id/estado` | 200 — pedido actualizado · 400 `DatosInvalidos` · 404 `NoEncontrado` |
| GET | `/reportes/facturacion` | 200 — `{ total }` |
| GET | `/reportes/cantidades` | 200 — `{ "Expreso": 10, "Pastelería": 3 }` |
| GET | `/reportes/mas-vendido` | 200 — `{ tipo, cantidad }` · 404 `{ error: "SinVentas" }` |

**Nuevo pedido:** `{ mesa?, items: [{ productoId, cantidad }] }`

- `mesa`: se puede omitir o enviar `null` para barra o para llevar. Si se
  indica, debe ser un entero positivo y estar registrada en SQLite
  (inicialmente 1 a 25). La respuesta siempre incluye `mesa: number | null`.
- `items`: al menos un ítem; `productoId` y `cantidad` deben ser enteros
  positivos, y el producto debe existir.
- El servidor asigna el ID y el estado inicial `pendiente`. El cliente no
  puede elegir el estado al crear el pedido.
- `GET /pedidos/:id` busca por **ID de pedido**. Una mesa puede tener varios
  pedidos con distintos IDs.

POST y PATCH rechazan propiedades adicionales en el objeto principal del
cuerpo. PATCH recibe únicamente `estado`, con uno de estos valores:
`pendiente`, `en_preparacion` o `entregado`. Se permite cambiar entre ellos
sin restricciones de transición.

Los IDs de pedido y el filtro `?mesa=` deben ser enteros positivos seguros;
si son inválidos, la respuesta es 400. El filtro lista pedidos por número de
mesa: no verifica su existencia y devuelve `[]` si no hay coincidencias.

El contrato usa los nombres `mesa`, `tamano` y `gramos`. Los cafés incluyen
`variedad` con acidez, cuerpo y notas.

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

## Ejemplos de solicitudes y respuestas

Los siguientes comandos usan Bash y suponen el servidor en el puerto 3000.
Los ejemplos de pedidos y reportes parten de una base sin pedidos; en una
base existente, el ID asignado y los reportes pueden ser diferentes.

```bash
curl http://localhost:3000/productos
curl http://localhost:3000/productos/5
```

`GET /productos` devuelve un array de productos. Para el producto 5,
`GET /productos/5` responde 200:

```json
{
  "id": 5,
  "tipo": "expreso",
  "nombre": "Expreso Mediano Colombia",
  "precioBase": 2500,
  "tamano": "Mediano",
  "gramos": 27,
  "variedad": {
    "id": 2,
    "nombre": "Colombia",
    "precioPorGramo": 180,
    "acidez": "media",
    "cuerpo": "equilibrado",
    "notas": "cítricas y florales"
  },
  "precio": 7360
}
```

Crear el pedido del ejemplo de la consigna:

```bash
curl -X POST http://localhost:3000/pedidos -H "Content-Type: application/json" \
  -d '{"mesa":4,"items":[{"productoId":5,"cantidad":2},{"productoId":19,"cantidad":1}]}'
```

Respuesta 201:

```json
{
  "id": 1,
  "mesa": 4,
  "estado": "pendiente",
  "items": [
    { "productoId": 5, "cantidad": 2 },
    { "productoId": 19, "cantidad": 1 }
  ],
  "total": 17220
}
```

Consultar y actualizar ese pedido:

```bash
curl http://localhost:3000/pedidos
curl 'http://localhost:3000/pedidos?mesa=4'
curl http://localhost:3000/pedidos/1
curl -X PATCH http://localhost:3000/pedidos/1/estado -H "Content-Type: application/json" \
  -d '{"estado":"en_preparacion"}'
```

GET individual y PATCH devuelven el pedido completo con el mismo formato.
El PATCH responde 200, conserva ID, mesa, ítems y total, y cambia `estado`
a `en_preparacion`. Un GET posterior refleja ese cambio.

Para barra, usar el mismo POST omitiendo `mesa` o con `"mesa": null`.

### Reportes

```bash
curl http://localhost:3000/reportes/facturacion
curl http://localhost:3000/reportes/cantidades
curl http://localhost:3000/reportes/mas-vendido
```

Con únicamente el pedido anterior, las respuestas son 200:

| Ruta | JSON |
|---|---|
| `/reportes/facturacion` | `{ "total": 17220 }` |
| `/reportes/cantidades` | `{ "Expreso": 2, "Pastelería": 1 }` |
| `/reportes/mas-vendido` | `{ "tipo": "expreso", "cantidad": 2 }` |

Las cantidades se agrupan por tipo, no por producto individual. Los reportes
incluyen todos los estados de pedido. Sin pedidos, facturación devuelve
`{ "total": 0 }`, cantidades devuelve `{}` y más vendido responde
404 `{ "error": "SinVentas" }`. En un empate, el orden es expreso,
filtrado y pastelería.

## Errores HTTP

Los errores incluyen una propiedad `error` con un código de texto:

| HTTP | JSON / motivo |
|---|---|
| 400 | `{ "error": "DatosInvalidos" }`: cuerpo inválido, JSON malformado, ID de pedido o filtro de mesa inválido |
| 400 | `{ "error": "MesaInexistente" }`: mesa no registrada, por ejemplo 26 en una base nueva |
| 400 | `{ "error": "ProductoInexistente", "productoId": 999 }`: producto inexistente al crear el pedido |
| 404 | `{ "error": "NoEncontrado" }`: producto o pedido no encontrado |
| 404 | `{ "error": "RutaNoEncontrada" }`: ruta no registrada |
| 404 | `{ "error": "SinVentas" }`: no hay resultados para más vendido |
| 413 | `{ "error": "CuerpoDemasiadoGrande" }`: cuerpo mayor que el límite de `express.json()` |
| Otros 4xx/5xx reconocidos, salvo 500 | `{ "error": "ErrorHTTP" }`: se conserva el código HTTP del error, por ejemplo 415 por charset no soportado |
| 500 | `{ "error": "ErrorInterno" }`: error inesperado, sin exponer detalles internos |

Un pedido rechazado por mesa o producto inexistente no inserta pedidos ni ítems.

## Tests

```sh
npm test                              # unitarios e integración
npm test -- tests/unit                # solo unitarios
npm test -- tests/integration         # solo integración
npm run test:e2e
```

- **Unitarios:** precios, total del pedido, reportes y existencia de mesas
  en `PedidoService`, con dobles donde corresponde.
- **Integración:** repositorios, inicialización y persistencia SQLite, y rutas
  HTTP con Supertest. Usan bases en memoria o archivos temporales, sin necesitar
  una API levantada.
- **E2E:** Playwright realiza peticiones HTTP contra la API real en el puerto
  4000. Comprueba un recorrido de catálogo, pedido y reportes, y el rechazo de
  un producto inexistente. Son pruebas de la API, sin navegador.

Playwright inicia `npm run start:e2e`, que configura `NODE_ENV=test` y
`PORT=4000`. Antes de cada test llama a reset y seed. Para evitar reutilizar
otro servidor, dejar libre el puerto 4000 antes de ejecutar los E2E.

### Rutas exclusivas de test

Solo se registran con `NODE_ENV=test`; en otros entornos responden 404.
Se pueden probar manualmente con `npm run start:e2e` y, en otra terminal:

```bash
curl -X POST http://localhost:4000/__test__/reset
curl -X POST http://localhost:4000/__test__/seed
```

- `POST /__test__/reset`: 204 sin cuerpo; borra pedidos e ítems, conservando
  productos y mesas.
- `POST /__test__/seed`: 201 con `{ "created": [...] }`; crea dos pedidos de
  prueba, uno de barra y otro de mesa 7. Usar reset antes de seed para obtener
  siempre el mismo escenario.
