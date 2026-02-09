import * as SQLite from "expo-sqlite";

let dbPromise = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("lavaquita.db");
  }
  return dbPromise;
}

// Devuelve:
// - SELECT => array de filas
// - INSERT/UPDATE/DELETE => objeto { changes, lastInsertRowId }
export async function executeSql(sql, params = []) {
  const db = await getDb();

  const isSelect = /^\s*select/i.test(sql);

  if (isSelect) {
    return await db.getAllAsync(sql, params);
  }

  return await db.runAsync(sql, params);
}