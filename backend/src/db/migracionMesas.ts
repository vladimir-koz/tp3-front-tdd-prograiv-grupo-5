import type Database from 'better-sqlite3';

export function migrarMesas(db: Database.Database): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS mesas (
            id INTEGER PRIMARY KEY
        );
    `);
}
