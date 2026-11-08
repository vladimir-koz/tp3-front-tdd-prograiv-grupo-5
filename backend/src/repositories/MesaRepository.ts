import type Database from 'better-sqlite3';

export class SqliteMesaRepository {
    constructor(private readonly db: Database.Database) {}

    existe(id: number): boolean {
        const fila = this.db.prepare('SELECT id FROM mesas WHERE id = ?').get(id);
        return fila !== undefined;
    }
}
