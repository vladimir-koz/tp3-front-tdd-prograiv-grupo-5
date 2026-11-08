# Cafetería Origen — Frontend del TP3

Aplicación React para pedir desde una mesa indicada en la URL o retirar en barra.
Consume la API del grupo: el catálogo, los precios y el total confirmado provienen
del backend.

## Stack y organización

React 19, TypeScript estricto, Vite 7, Zod 4 y Bootstrap 5 personalizado con Sass.
Para pruebas se utilizan Vitest 3, React Testing Library, user-event, jsdom,
MSW 2 y Playwright.

```text
src/
  api/           Cliente HTTP único, esquemas Zod y tipos inferidos
  dominio/       Lectura de mesa, selección de café y formato de precios
  componentes/   Encabezado, catálogo, carrito y confirmación
  carrito/       Context y reducer puro con cantidades y subtotales
  menu/          useMenu: carga del catálogo, errores y reintento
  test/          Configuración, fixtures y utilidades compartidas
    integracion/ Pruebas con MSW
  App.tsx        Coordinación del menú, carrito y creación del pedido
  main.tsx       Montaje de React y CarritoProvider
  styles.scss    Variables de la cafetería y Bootstrap
e2e/             Recorrido Playwright con navegador y API reales
```

Los tests de componentes y funciones permanecen junto a los archivos que prueban.

## Flujo de la aplicación

- `leerMesa()` interpreta `?mesa=N`. Sin un entero positivo seguro se utiliza
  `null`, que representa retiro en barra. La API comprueba que la mesa exista.
- `useMenu()` obtiene el catálogo y expone una unión discriminada: `cargando`,
  `error` o `listo`. La interfaz muestra la carga y permite reintentar si falla.
- El selector combina bebida, tamaño y origen; muestra las características de
  cada variedad y su precio. Pastelería permite agregar muffin o selva negra.
- `CarritoProvider`, montado en `main.tsx`, comparte el estado mediante
  `useCarrito()`. El reducer agrupa productos por ID y resuelve agregar, sumar,
  restar, quitar y vaciar sin mutar el estado anterior.
- `Carrito` muestra cantidades y subtotales utilizando las funciones existentes.
  El subtotal es orientativo. Con el carrito vacío o un envío pendiente no se
  puede confirmar. El carrito se mantiene en memoria mientras la aplicación está abierta.
- App envía mesa e ítems y solo vacía el carrito después de recibir un pedido
  válido. Si falla, muestra el mensaje y conserva el contenido para reintentar.
- `Confirmacion` muestra el número, estado y total de la respuesta. El botón
  «Actualizar estado» consulta nuevamente el pedido; si falla, conserva los datos
  anteriores y muestra el error.

## Comunicación con la API

`src/api/cliente.ts` concentra las llamadas HTTP mediante `fetch`:

| Función | Solicitud |
|---|---|
| `obtenerProductos()` | `GET /productos` |
| `crearPedido()` | `POST /pedidos` |
| `obtenerPedido(id)` | `GET /pedidos/:id` |

Las solicitudes usan el origen del navegador. En desarrollo las redirige Vite;
con Docker, Nginx. No se necesitan URLs del backend dentro de los componentes.

Los datos de las respuestas exitosas se validan con Zod antes de usarse y los
tipos `Producto` y `Pedido` se derivan mediante `z.infer`. Una respuesta incompatible
rechaza la operación con «La respuesta del servidor no tiene el formato esperado».
Los errores HTTP conservan el campo `error` de la API. Una falla de conexión, o un
error sin ese formato (por ejemplo, el 500 vacío del proxy de Vite o el 502 de Nginx
con la API apagada), produce «No se pudo conectar con el servidor».

El cuerpo de creación utiliza los nombres del backend oficial:

```json
{
  "mesa": 4,
  "items": [
    { "productoId": 5, "cantidad": 2 },
    { "productoId": 19, "cantidad": 1 }
  ]
}
```

Para barra se envía `mesa: null`. La respuesta incluye `id`, `mesa`, `estado`,
`items` y `total`. Los estados son `pendiente`, `en_preparacion` y `entregado`.
El frontend no recalcula el total confirmado.
El [README del backend](../backend/README.md) detalla el contrato completo.

## Instalación y ejecución local

Usar Node.js 22, versión 22.12 o posterior, y npm 10. Todos los comandos de esta
sección se ejecutan desde `frontend/`:

```sh
npm ci
npm run dev
```

La API debe estar levantada por separado en el puerto 3000; consultar la
[guía del backend](../backend/README.md). Abrir normalmente
`http://localhost:5173/?mesa=4`, o la dirección indicada por Vite.

| Comando | Función |
|---|---|
| `npm run dev` | Inicia Vite |
| `npm run typecheck` | Comprueba TypeScript sin emitir archivos |
| `npm run build` | Comprueba TypeScript y compila en `dist/` |
| `npm test` | Ejecuta unitarias, componentes e integración |
| `npm run test:watch` | Ejecuta Vitest en modo watch |
| `npm run test:e2e` | Inicia los servidores y ejecuta Playwright |

## Pruebas y entornos

`npm test` no necesita la API levantada. Las funciones puras y el reducer se
prueban con Vitest; los componentes, con Testing Library y user-event. Las
integraciones de `src/test/integracion/` utilizan handlers MSW locales y la
configuración compartida de `src/test/`. Vitest excluye `e2e/`.

Para el recorrido de navegador, instalar previamente las dependencias de ambos
proyectos. Desde `frontend/`:

```sh
npm --prefix ../backend ci
npx playwright install chromium
npm run test:e2e
```

Playwright ejecuta un único worker con Chromium. Levanta Vite en
`127.0.0.1:5173` y el backend con `NODE_ENV=test` en el puerto 4000, sin reutilizar
servidores existentes. Ambos puertos deben estar libres. El test prepara los
datos mediante reset/seed, realiza la compra y verifica la consulta del estado
después de actualizarlo mediante la API real. No utiliza MSW.

| Entorno | Destino de la API | Persistencia |
|---|---|---|
| Desarrollo con Vite | `http://localhost:3000` por defecto | SQLite local del backend |
| E2E del frontend | `http://127.0.0.1:4000`, mediante `API_URL` | SQLite en memoria |
| Docker Compose | Nginx → `backend:3000` | Volumen Docker |

`API_URL` configura el proxy del proceso Vite; Playwright la establece para los
E2E. No es una configuración del navegador ni del frontend compilado.

Para levantar ambos servicios con Docker, seguir el [README principal](../README.md).
