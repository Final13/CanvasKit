/**
 * Клиент MySQL через serverless-mysql; singleton на процесс.
 * Без переменных окружения MYSQL_* возвращает null.
 */
import serverlessMysql from "serverless-mysql";

const globalForMysql = globalThis as unknown as {
  mysqlClient?: ReturnType<typeof serverlessMysql>;
};

function isMysqlConfigured(): boolean {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_DATABASE &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_PASSWORD
  );
}

function createMysqlClient(): ReturnType<typeof serverlessMysql> {
  const portValue = Number(process.env.MYSQL_PORT ?? "3306");
  const port = Number.isFinite(portValue) ? portValue : 3306;

  return serverlessMysql({
    config: {
      host: process.env.MYSQL_HOST,
      port,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      charset: "utf8mb4",
      connectTimeout: 10000,
    },
  });
}

export type MysqlClient = ReturnType<typeof serverlessMysql>;

export function getMysqlClient(): MysqlClient | null {
  if (!isMysqlConfigured()) {
    return null;
  }

  if (!globalForMysql.mysqlClient) {
    globalForMysql.mysqlClient = createMysqlClient();
  }

  return globalForMysql.mysqlClient;
}
