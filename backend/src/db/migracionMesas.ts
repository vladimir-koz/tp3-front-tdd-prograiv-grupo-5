import type Database from 'better-sqlite3';

export function migrarMesas(db: Database.Database): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS mesas (
            id INTEGER PRIMARY KEY
        );
    `);

    const insertar = db.prepare('INSERT OR IGNORE INTO mesas (id) VALUES (?)');
    db.transaction(() => {
        for (let id = 1; id <= 25; id++) {
            insertar.run(id);
        }
    })();
}
