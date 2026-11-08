import { describe,expect, it} from 'vitest';

import { createDb } from '../../src/db/connection';

describe('createDb',()=>{
    it('carga los 20 productos en una base nueva',()=>{
        const db=createDb(':memory:');

        try{
            const fila=db.prepare('SELECT COUNT(*) AS cantidad FROM productos').get();
            expect(fila).toEqual({cantidad:20});
        }finally{
            db.close();
        }
    });
});