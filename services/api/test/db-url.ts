/** URL del Postgres de test. Obligatoria y separada de la DB de desarrollo:
 *  los tests e2e borran todas las tablas entre casos. */
export function testDatabaseUrl(): string {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) {
    throw new Error(
      'Falta DATABASE_URL_TEST. Agregala a .env (ver .env.example) apuntando a una DB ' +
        'separada, p. ej. postgresql://hubador:hubador@localhost:5432/hubador_test',
    );
  }
  return url;
}
