import { executeSql } from "./database";

export async function initDatabase() {
  // Asegurar que las FK estén activas (por si usas constraints)
  await executeSql(`PRAGMA foreign_keys = ON;`);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS coins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
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
      created_at TEXT NOT NULL,
      FOREIGN KEY (coin_id) REFERENCES coins(id)
    );
  `);

  // Monedas base
  const baseCoins = [
    { name: "$10", value: 10, variant: null },
    { name: "$50", value: 50, variant: null },
    { name: "$100 chica", value: 100, variant: "chica" },
    { name: "$100 grande", value: 100, variant: "grande" },
    { name: "$500", value: 500, variant: null },
  ];

  for (const c of baseCoins) {
    await executeSql(
      `
      INSERT OR IGNORE INTO coins (name, value, variant)
      VALUES (?, ?, ?);
    `,
      [c.name, c.value, c.variant]
    );
  }
}