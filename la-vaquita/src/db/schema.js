import { getDb } from "./database";

export async function initDatabase() {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA foreign_keys = OFF;

    BEGIN TRANSACTION;

    CREATE TABLE IF NOT EXISTS coins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      value INTEGER NOT NULL,
      variant TEXT
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coin_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (coin_id) REFERENCES coins(id)
    );

    /* 1️⃣ Limpia registros huérfanos */
    DELETE FROM records
    WHERE coin_id NOT IN (SELECT id FROM coins);

    /* 2️⃣ Deduplicación segura de monedas */
    DELETE FROM coins
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM coins
      GROUP BY name
    );

    /* 3️⃣ Índice único (después de dedupe) */
    CREATE UNIQUE INDEX IF NOT EXISTS idx_coins_name ON coins(name);

    COMMIT;

    PRAGMA foreign_keys = ON;
  `);

  /* 4️⃣ Seed seguro */
  const baseCoins = [
    { name: "$10", value: 10 },
    { name: "$50", value: 50 },
    { name: "$100 chica", value: 100, variant: "chica" },
    { name: "$100 grande", value: 100, variant: "grande" },
    { name: "$500", value: 500 },
  ];

  for (const c of baseCoins) {
    await db.runAsync(
      `INSERT OR IGNORE INTO coins (name, value, variant)
       VALUES (?, ?, ?);`,
      [c.name, c.value, c.variant ?? null]
    );
  }
}