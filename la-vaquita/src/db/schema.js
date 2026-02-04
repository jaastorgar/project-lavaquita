import { executeSql } from "./database";

export async function initDatabase() {
  // Aseguramos que las tablas existan antes de cualquier otra cosa
  await executeSql(`
    CREATE TABLE IF NOT EXISTS coins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      value INTEGER NOT NULL,
      variant TEXT
    );
  `);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coin_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  const baseCoins = [
    { name: "$10", value: 10 },
    { name: "$50", value: 50 },
    { name: "$100 chica", value: 100, variant: "chica" },
    { name: "$100 grande", value: 100, variant: "grande" },
    { name: "$500", value: 500 },
  ];

  // Inserción secuencial para evitar errores de conexión
  for (const c of baseCoins) {
    try {
      await executeSql(
        `INSERT OR IGNORE INTO coins (name, value, variant) VALUES (?, ?, ?);`,
        [c.name, c.value, c.variant || null]
      );
    } catch (e) {
      console.log("Error insertando moneda base:", c.name);
    }
  }
}