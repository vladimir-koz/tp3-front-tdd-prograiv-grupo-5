import Database from "better-sqlite3";

export function createDb(path: string = ':memory:'): Database.Database{
    const db=new Database(path);
    db.pragma('foreign_keys = ON');

    db.exec(`
        CREATE TABLE IF NOT EXISTS variedades (
            id INTEGER PRIMARY KEY,
            nombre TEXT NOT NULL UNIQUE,
            precioPorGramo INTEGER NOT NULL,
            acidez TEXT NOT NULL,
            cuerpo TEXT NOT NULL,
            notas TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS productos(
            id INTEGER PRIMARY KEY,
            tipo TEXT NOT NULL CHECK (tipo IN('expreso','filtrado','pasteleria')),
            nombre TEXT NOT NULL UNIQUE,
            precioBase INTEGER NOT NULL,
            tamano TEXT,
            variedadId INTEGER REFERENCES variedades(id)
        );
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY,
            mesa INTEGER CHECK (mesa IS NULL OR mesa > 0),
            estado TEXT NOT NULL DEFAULT 'pendiente'
                CHECK (estado IN ('pendiente', 'en_preparacion', 'entregado'))
            );

        CREATE TABLE IF NOT EXISTS pedido_items (
            pedidoId INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
            productoId INTEGER NOT NULL REFERENCES productos(id),
            cantidad INTEGER NOT NULL CHECK (cantidad > 0)
        );
    `);
    const yaHayProductos=db.prepare('SELECT 1 FROM productos LIMIT 1').get();

    if(yaHayProductos===undefined){
        const variedades = [
            { id: 1, nombre: 'Brasil', precioPorGramo: 140, acidez: 'baja', cuerpo: 'denso', notas: 'avellana' },
            { id: 2, nombre: 'Colombia', precioPorGramo: 180, acidez: 'media', cuerpo: 'equilibrado', notas: 'cítricas y florales' },
            { id: 3, nombre: 'Etiopía', precioPorGramo: 240, acidez: 'muy viva', cuerpo: 'ligero', notas: 'frutales' }
        ];

        const cafes = [
            { tipo: 'expreso', etiqueta: 'Expreso', precioBase: 2500 },
            { tipo: 'filtrado', etiqueta: 'Filtrado', precioBase: 3200 }
        ];


        const tamanos = ['Pocillo', 'Mediano', 'Taza grande'];

        const pasteleria = [
            { nombre: 'Muffin de chocolate', precioBase: 2500 },
            { nombre: 'Porción de torta selva negra', precioBase: 4200 }
        ];
        const insertarVariedad = db.prepare(`
            INSERT INTO variedades(id,nombre,precioPorGramo,acidez,cuerpo,notas)
            VALUES (@id,@nombre,@precioPorGramo,@acidez,@cuerpo,@notas)
        `);

        const insertarProducto = db.prepare(`
            INSERT INTO productos (id, tipo, nombre, precioBase, tamano, variedadId)
            VALUES (@id, @tipo, @nombre, @precioBase, @tamano, @variedadId)
        `);
        db.transaction(()=>{
                for (const variedad of variedades) {
            insertarVariedad.run(variedad);
            }

            let id = 1;

            for (const cafe of cafes) {
                for (const tamano of tamanos) {
                for (const variedad of variedades) {
                    insertarProducto.run({
                    id,
                    tipo: cafe.tipo,
                    nombre: `${cafe.etiqueta} ${tamano} ${variedad.nombre}`,
                    precioBase: cafe.precioBase,
                    tamano,
                    variedadId: variedad.id
                    });
                    id++;
                }
                }
            }

            for (const producto of pasteleria) {
                insertarProducto.run({
                id,
                tipo: 'pasteleria',
                nombre: producto.nombre,
                precioBase: producto.precioBase,
                tamano: null,
                variedadId: null
                });
                id++;
            }
        })();
    }
    return db;
}