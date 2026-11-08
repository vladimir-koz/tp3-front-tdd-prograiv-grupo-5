# Cafetería Origen — TP3 Programación IV

Proyecto académico de Programación IV, TUP, UTN FRBB. Reutiliza la API del
Parcial I y agrega una aplicación React para consultar el catálogo, elegir café
y pastelería, administrar el carrito y confirmar pedidos.

La mesa se obtiene de la URL (`/?mesa=4`). Sin ese parámetro, o si su valor es
inválido, el pedido es para retirar en barra. La confirmación muestra el número,
estado y total devueltos por la API y permite consultar el estado actualizado.
Si el envío falla, se informa el error y se conserva el carrito para reintentar.

## Tecnologías

- Frontend: React 19, TypeScript estricto, Vite 7, Zod 4 y Bootstrap 5 con Sass.
- Backend: Node.js 22, TypeScript, Express 4, Zod 3 y SQLite con better-sqlite3.
- Pruebas: Vitest, React Testing Library, MSW 2, Supertest y Playwright.
- Ejecución con Docker Compose: Nginx para el frontend y Node para la API.

## Estructura

```text
backend/       API, persistencia SQLite y pruebas del backend
frontend/      Aplicación React y pruebas del frontend
compose.yaml   Servicios frontend/backend y volumen de SQLite
```

Cada aplicación tiene su propio `package.json` y lockfile. Los comandos de esta
guía se ejecutan desde la raíz del repositorio.

## Ejecutar con Docker Compose

Requiere Docker con Docker Compose y el puerto 8080 disponible.

```sh
docker compose up --build -d
docker compose ps
```

Abrir **http://localhost:8080/?mesa=4**. Para barra, abrir
**http://localhost:8080/**.

Nginx sirve el frontend compilado y redirige las solicitudes API al servicio
`backend:3000`. El puerto del backend no se publica al host; por ejemplo,
`http://localhost:8080/health` permite comprobar la API. Compose espera que el
backend esté saludable antes de iniciar el frontend.

```sh
docker compose logs -f
docker compose down
```

SQLite se guarda en `/app/data/cafeteria.sqlite`, dentro del volumen nombrado
`sqlite-data` de Compose. Los pedidos se conservan al recrear los contenedores
y después de `down` y `up`. Eliminar el volumen elimina esos datos.
Esta base es independiente de la utilizada durante el desarrollo local.

Los Dockerfiles utilizan `npm ci` con los lockfiles existentes. El backend se
ejecuta con `NODE_ENV=production`; las rutas exclusivas de test no están disponibles.

## Ejecutar localmente sin Docker

Usar Node.js 22, versión 22.12 o posterior, y npm 10. Instalar las dependencias
de ambas aplicaciones:

```sh
npm --prefix backend ci
npm --prefix frontend ci
```

Iniciar la API en una terminal:

```sh
npm --prefix backend run dev
```

En otra terminal, iniciar React:

```sh
npm --prefix frontend run dev
```

La API escucha en `http://localhost:3000`. Vite utiliza normalmente
`http://localhost:5173` y muestra la dirección efectiva en la terminal.
Su proxy apunta al puerto 3000 por defecto, sin requerir CORS ni una URL de API
en el código del navegador. Detener cada proceso con Ctrl+C.

La API crea `backend/data/cafeteria.sqlite`, carga el catálogo inicial y registra
las mesas 1–25. Una mesa positiva que no exista se rechaza al confirmar.

Para comprobar TypeScript y compilar:

```sh
npm --prefix backend run build
npm --prefix frontend run typecheck
npm --prefix frontend run build
```

## Pruebas

Unitarias, componentes e integración, sin servidores levantados:

```sh
npm --prefix backend test
npm --prefix frontend test
```

E2E de la API y recorrido de navegador, ejecutados por separado:

```sh
npm --prefix backend run test:e2e

# Instalar Chromium una vez para los E2E del frontend.
cd frontend
npx playwright install chromium
npm run test:e2e
```

Los E2E del backend realizan peticiones HTTP. Los del frontend abren Chromium
y utilizan React y la API reales, sin MSW. Playwright inicia los servidores
necesarios; dejar libres los puertos 4000 y 5173 para el recorrido del frontend.
El backend de test utiliza SQLite en memoria y reset/seed preparan sus datos.
Los tests no utilizan el volumen de Docker ni la base de desarrollo.

## Documentación específica

- [Frontend: organización, comandos y pruebas](frontend/README.md).
- [Backend: ejecución, persistencia y contrato HTTP completo](backend/README.md).
