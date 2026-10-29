import { mkdirSync } from 'node:fs';
import { makeApp } from './app';
import { createDb } from './db/connection';

const puerto=Number(process.env.PORT ?? '3000');
const rutaDb=process.env.NODE_ENV === 'test' ? ':memory:' : 'data/cafeteria.sqlite';

if (rutaDb !==':memory:'){
    mkdirSync('data',{recursive:true});
}
const db=createDb(rutaDb);

makeApp(db).listen(puerto,()=>{
    console.log(`Servidor iniciado en http://localhost:${puerto}`);
});