import * as SQLite from "expo-sqlite";

let db = null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("lavaquita.db");

    // Ajustes para reducir bloqueos
    // (si alguna falla, no pasa nada: seguimos igual)
    try {
      await db.execAsync(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
      `);
    } catch (e) {
      // opcional: console.log("PRAGMA warning:", e);
    }
  }
  return db;
}

// Reintentos automáticos si SQLite está locked/busy
export async function executeSql(sql, params = []) {
  const database = await getDb();
  const isSelect = sql.trim().toUpperCase().startsWith("SELECT");

  const maxRetries = 6;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (isSelect) {
        return await database.getAllAsync(sql, params); // ARRAY
      }
      return await database.runAsync(sql, params); // { lastInsertRowId, changes }
    } catch (err) {
      const msg = String(err?.message ?? err);
      const locked =
        msg.toLowerCase().includes("locked") ||
        msg.toLowerCase().includes("busy");

      if (!locked || attempt === maxRetries) {
        throw err;
      }

      // backoff simple
      await sleep(120 * (attempt + 1));
    }
  }
}