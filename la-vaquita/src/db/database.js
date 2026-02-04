import * as SQLite from "expo-sqlite";

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("lavaquita.db");
  }
  return dbInstance;
}

export async function executeSql(sql, params = []) {
  const db = await getDb();
  try {
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      return await db.getAllAsync(sql, params);
    } else {
      return await db.runAsync(sql, params);
    }
  } catch (error) {
    console.error("Error SQL:", error);
    throw error;
  }
}

// Función para el botón del menú de reinicio
export async function deleteAllData() {
  await executeSql(`DELETE FROM records;`);
  await executeSql(`DELETE FROM sqlite_sequence WHERE name='records';`);
}